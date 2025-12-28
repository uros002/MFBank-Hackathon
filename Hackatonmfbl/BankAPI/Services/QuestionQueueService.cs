using System.Collections.Concurrent;
using System.Net.Sockets;
using System.Text;
using System.Text.Json;
using BankAPI.Models;
using BankAPI.DTOs;

namespace BankAPI.Services
{
    public class QuestionQueueService : BackgroundService
    {
        private readonly ConcurrentQueue<QuestionDto> _questionQueue;
        private readonly ConcurrentDictionary<string, QuestionDto> _questionsById;
        private readonly FAQMatcher _faqMatcher;
        private readonly EmailService _emailService;
        private readonly ILogger<QuestionQueueService> _logger;
        private readonly List<TcpClient> _connectedClients;
private readonly PythonFAQService _pythonFAQService;
        public QuestionQueueService(
            PythonFAQService pythonFAQService,
            FAQMatcher faqMatcher, 
            EmailService emailService, 
            ILogger<QuestionQueueService> logger)
        {
            _questionQueue = new ConcurrentQueue<QuestionDto>();
            _questionsById = new ConcurrentDictionary<string, QuestionDto>();
            _faqMatcher = faqMatcher;
            _emailService = emailService;
            _logger = logger;
             _pythonFAQService = pythonFAQService;
            _connectedClients = new List<TcpClient>();
        }

        // Add new question to queue
public async Task<QuestionDto> AddQuestionAsync(QuestionRequest request)
{
    FAQResult matchResult;
    
    // Special handling for "Ostalo" category
    if (request.Category == "Ostalo/Ne znam")
    {
        _logger.LogInformation("Category is 'Ostalo' - using AI to determine category and answer");
        matchResult = await _pythonFAQService.ProcessQuestionAsync(request.Question, null);
    }
    else
    {
        _logger.LogInformation($"Category provided: {request.Category} - searching for answer in this category");
        matchResult = await _pythonFAQService.ProcessQuestionAsync(request.Question, request.Category);
    }

    var questionDto = new QuestionDto
    {
        Id = Guid.NewGuid().ToString(),
        Name = request.Name,
        Surname = request.Surname,
        Phone = request.Phone,
        Email = request.Email,
        Office = request.Office,
        Category = matchResult.Success ? matchResult.Category : (request.Category ?? "Unknown"),
        Question = request.Question,
        SuggestedAnswer = matchResult.Answer,
        MatchType = matchResult.MatchType,
        Confidence = matchResult.Confidence,
        SubmittedAt = DateTime.UtcNow,
        IsAnswered = false,
        IsHighAlert = false,
        TimeLeftMinutes = 15
    };

    // Add to queue and dictionary
    _questionQueue.Enqueue(questionDto);
    _questionsById.TryAdd(questionDto.Id, questionDto);

    _logger.LogInformation($"New question added: {questionDto.Id} from {questionDto.Name} {questionDto.Surname}, Category: {questionDto.Category}, MatchType: {questionDto.MatchType}, Confidence: {questionDto.Confidence}");

    // Always send email if email is provided
    if (!string.IsNullOrWhiteSpace(questionDto.Email))
    {
        try
        {
            // Check if we have a valid AI answer
            bool hasValidAnswer = matchResult.Success && 
                                 matchResult.MatchType != "error" &&
                                 matchResult.MatchType != "none" &&
                                 matchResult.Confidence > 0 &&
                                 !matchResult.Answer.Contains("No quick answer found") &&
                                 !matchResult.Answer.Contains("Operator should review");

            if (hasValidAnswer)
            {
                // Send email WITH AI answer
                await _emailService.SendAnswerEmailAsync(
                    questionDto.Email,
                    $"{questionDto.Name} {questionDto.Surname}",
                    questionDto.Question,
                    questionDto.SuggestedAnswer
                );
                _logger.LogInformation($"Email with AI answer sent to {questionDto.Email} (Confidence: {questionDto.Confidence})");
            }
            else
            {
                // Send email WITHOUT AI answer (just confirmation)
                await _emailService.SendConfirmationEmailAsync(
                    questionDto.Email,
                    $"{questionDto.Name} {questionDto.Surname}",
                    questionDto.Question
                );
                _logger.LogInformation($"Confirmation email (without AI answer) sent to {questionDto.Email}");
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, $"Failed to send email to {questionDto.Email} - continuing without email");
        }
    }

    // Send notification to connected clients
    await BroadcastNotificationAsync(questionDto);

    return questionDto;
}

        // Get all questions
        public List<QuestionDto> GetAllQuestions()
        {
            return _questionsById.Values.OrderByDescending(q => q.SubmittedAt).ToList();
        }

        // Get question by ID
        public QuestionDto? GetQuestionById(string id)
        {
            _questionsById.TryGetValue(id, out var question);
            return question;
        }

        // Get high alert questions (5 minutes or less remaining)
        public List<QuestionDto> GetHighAlertQuestions()
        {
            return _questionsById.Values
                .Where(q => q.IsHighAlert && !q.IsAnswered)
                .OrderBy(q => q.SubmittedAt)  // Changed from OrderBy(q => q.TimeLeftMinutes)
                .ToList();
        }

        // Get new questions (more than 5 minutes remaining)
        public List<QuestionDto> GetNewQuestions()
        {
            return _questionsById.Values
                .Where(q => !q.IsHighAlert && !q.IsAnswered)
                .OrderBy(q => q.SubmittedAt)  // Changed from OrderByDescending
                .ToList();
        }

        // Background service to check timers every minute
        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("QuestionQueueService background task started");

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await CheckQuestionsTimerAsync();
                    await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error in QuestionQueueService background task");
                }
            }

            _logger.LogInformation("QuestionQueueService background task stopped");
        }

        private async Task CheckQuestionsTimerAsync()
        {
            var now = DateTime.UtcNow;
            var questionsToUpdate = new List<QuestionDto>();

            foreach (var question in _questionsById.Values.Where(q => !q.IsAnswered))
            {
                var elapsedTime = (now - question.SubmittedAt).TotalMinutes;
                var timeLeft = 15 - (int)Math.Ceiling(elapsedTime);

                // Update time left
                question.TimeLeftMinutes = Math.Max(0, timeLeft);

                // Check if should be moved to high alert (5 minutes or less)
                if (timeLeft <= 5 && !question.IsHighAlert)
                {
                    question.IsHighAlert = true;
                    questionsToUpdate.Add(question);
                    _logger.LogWarning($"Question {question.Id} moved to HIGH ALERT (Time left: {timeLeft} min)");
                }

                // Log if time expired (15 minutes passed)
                if (timeLeft <= 0 && !question.IsHighAlert)
                {
                    question.IsHighAlert = true;
                    _logger.LogError($"Question {question.Id} TIME EXPIRED - still in queue!");
                }
            }

            // Notify clients about updated questions
            if (questionsToUpdate.Count > 0)
            {
                foreach (var question in questionsToUpdate)
                {
                    await BroadcastNotificationAsync(question, "HIGH_ALERT");
                }
            }

            _logger.LogInformation($"Timer check complete. Total questions: {_questionsById.Count}, High alert: {GetHighAlertQuestions().Count}");
        }

        // TCP notification broadcasting
        private async Task BroadcastNotificationAsync(QuestionDto question, string type = "NEW_QUESTION")
        {
            var notification = new
            {
                type = type,
                question = new
                {
                    id = question.Id,
                    name = question.Name,
                    surname = question.Surname,
                    category = question.Category,
                    question = question.Question,
                    timeLeft = question.TimeLeftMinutes,
                    isHighAlert = question.IsHighAlert,
                    submittedAt = question.SubmittedAt
                },
                timestamp = DateTime.UtcNow
            };

            var message = JsonSerializer.Serialize(notification);
            var data = Encoding.UTF8.GetBytes(message + "\n");

            // Remove disconnected clients
            _connectedClients.RemoveAll(client => !client.Connected);

            // Send to all connected clients
            foreach (var client in _connectedClients.ToList())
            {
                try
                {
                    await client.GetStream().WriteAsync(data, 0, data.Length);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Failed to send notification to client");
                    _connectedClients.Remove(client);
                }
            }

            _logger.LogInformation($"Notification broadcast: {type} for question {question.Id}");
        }

        // Add connected client for notifications
        public void AddClient(TcpClient client)
        {
            _connectedClients.Add(client);
            _logger.LogInformation($"New client connected. Total clients: {_connectedClients.Count}");
        }

        public QuestionDto? MarkAsAnswered(string id, string operatorAnswer)
        {
            if (_questionsById.TryGetValue(id, out var question))
            {
                question.IsAnswered = true;
                question.AnsweredAt = DateTime.UtcNow;
                question.OperatorAnswer = operatorAnswer;
                
                _logger.LogInformation($"Question {id} marked as answered");
                return question;
            }
            
            _logger.LogWarning($"Question {id} not found");
            return null;
        }

        // Get answered questions (history)
        public List<QuestionDto> GetAnsweredQuestions()
        {
            return _questionsById.Values
                .Where(q => q.IsAnswered)
                .OrderByDescending(q => q.AnsweredAt)
                .ToList();
        }

        // Get answered questions count
        public int GetAnsweredCount()
        {
            return _questionsById.Values.Count(q => q.IsAnswered);
        }

        // Get total question count
        public int GetTotalCount()
        {
            return _questionsById.Values.Count(q => !q.IsAnswered);
        }
    }
}