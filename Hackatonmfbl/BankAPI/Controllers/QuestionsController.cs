using Microsoft.AspNetCore.Mvc;
using BankAPI.Models;
using BankAPI.Services;

namespace BankAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class QuestionsController : ControllerBase
    {
        private readonly QuestionQueueService _queueService;
        private readonly EmailService _emailService;
        private readonly ILogger<QuestionsController> _logger;

        public QuestionsController(QuestionQueueService queueService, ILogger<QuestionsController> logger, EmailService emailService)
        {
            _queueService = queueService;
            _logger = logger;
            _emailService = emailService;
        }

        [HttpPost]
        public async Task<IActionResult> ProcessQuestion([FromBody] QuestionRequest request)
        {
            try
            {
                _logger.LogInformation($"Processing question from: {request.Name} {request.Surname}");

                var questionDto = await _queueService.AddQuestionAsync(request);

                return Ok(new
                {
                    success = true,
                    data = new
                    {
                        id = questionDto.Id,
                        category = questionDto.Category,
                        suggestedAnswer = questionDto.SuggestedAnswer,
                        matchType = questionDto.MatchType,
                        confidence = questionDto.Confidence,
                        emailSent = !string.IsNullOrWhiteSpace(questionDto.Email)
                    },
                    message = "Vaš zahtjev je uspješno primljen i biće obrađen u najkraćem roku."
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing question");
                return BadRequest(new { success = false, error = ex.Message });
            }
        }

        [HttpGet]
        public IActionResult GetAllQuestions()
        {
            try
            {
                var questions = _queueService.GetAllQuestions();
                return Ok(new { success = true, questions = questions, count = questions.Count });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all questions");
                return BadRequest(new { success = false, error = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public IActionResult GetQuestionById(string id)
        {
            try
            {
                var question = _queueService.GetQuestionById(id);
                
                if (question == null)
                {
                    return NotFound(new { success = false, error = "Question not found" });
                }

                return Ok(new { success = true, question = question });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting question {id}");
                return BadRequest(new { success = false, error = ex.Message });
            }
        }

        [HttpGet("high-alert")]
        public IActionResult GetHighAlertQuestions()
        {
            try
            {
                var questions = _queueService.GetHighAlertQuestions();
                return Ok(new { success = true, questions = questions, count = questions.Count });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting high alert questions");
                return BadRequest(new { success = false, error = ex.Message });
            }
        }

        [HttpGet("new")]
        public IActionResult GetNewQuestions()
        {
            try
            {
                var questions = _queueService.GetNewQuestions();
                return Ok(new { success = true, questions = questions, count = questions.Count });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting new questions");
                return BadRequest(new { success = false, error = ex.Message });
            }
        }

        [HttpGet("count")]
        public IActionResult GetTotalCount()
        {
            try
            {
                var count = _queueService.GetTotalCount();
                return Ok(new { success = true, count = count });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting total count");
                return BadRequest(new { success = false, error = ex.Message });
            }
        }

        [HttpGet("test")]
        public IActionResult Test()
        {
            return Ok(new { message = "API is working!", timestamp = DateTime.Now });
        }

        [HttpPut("{id}/mark-answered")]
        public IActionResult MarkAsAnswered(string id, [FromBody] MarkAnsweredRequest request)
        {
            try
            {
                _logger.LogInformation($"Marking question {id} as answered");

                var question = _queueService.MarkAsAnswered(id, request.OperatorAnswer);
                
                if (question == null)
                {
                    return NotFound(new { success = false, error = "Question not found" });
                }

                return Ok(new 
                { 
                    success = true, 
                    message = "Pitanje je uspješno označeno kao odgovoreno",
                    question = question
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error marking question {id} as answered");
                return BadRequest(new { success = false, error = ex.Message });
            }
        }

        [HttpGet("answered")]
        public IActionResult GetAnsweredQuestions()
        {
            try
            {
                var questions = _queueService.GetAnsweredQuestions();
                return Ok(new { success = true, questions = questions, count = questions.Count });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting answered questions");
                return BadRequest(new { success = false, error = ex.Message });
            }
        }

        [HttpGet("answered/count")]
        public IActionResult GetAnsweredCount()
        {
            try
            {
                var count = _queueService.GetAnsweredCount();
                return Ok(new { success = true, count = count });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting answered count");
                return BadRequest(new { success = false, error = ex.Message });
            }
        }

        [HttpPost("{id}/send-operator-email")]
public async Task<IActionResult> SendOperatorEmail(Guid id, [FromBody] OperatorEmailRequest request)
{
    if (request == null)
        return BadRequest("Invalid request body.");

    await _emailService.SendOperatorEmail(
        request.ToEmail,
        request.CustomerName,
        request.Question,
        request.Answer
    );

    return Ok(new { success = true });
}

public class OperatorEmailRequest
{
    public string ToEmail { get; set; }
    public string CustomerName { get; set; }
    public string Question { get; set; }
    public string Answer { get; set; }
}

        

        // Add this model class at the bottom of the file or in Models folder
        public class MarkAnsweredRequest
        {
            public string OperatorAnswer { get; set; } = string.Empty;
        }
    }
}