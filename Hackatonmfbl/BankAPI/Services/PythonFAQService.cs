using System.Text;
using System.Text.Json;

namespace BankAPI.Services
{
    public class PythonFAQService
    {
        private readonly HttpClient _httpClient;
        private readonly ILogger<PythonFAQService> _logger;
        private const string PYTHON_API_URL = "http://localhost:5001/api/process-question";

        public PythonFAQService(ILogger<PythonFAQService> logger)
        {
            _httpClient = new HttpClient();
            _logger = logger;
        }

        public async Task<FAQResult> ProcessQuestionAsync(string question, string? category = null)
        {
            try
            {
                var requestBody = new
                {
                    question = question,
                    category = category
                };

                var jsonContent = JsonSerializer.Serialize(requestBody);
                var content = new StringContent(jsonContent, Encoding.UTF8, "application/json");

                var response = await _httpClient.PostAsync(PYTHON_API_URL, content);
                
                if (!response.IsSuccessStatusCode)
                {
                    _logger.LogError($"Python API returned status code: {response.StatusCode}");
                    return new FAQResult
                    {
                        Success = false,
                        Category = "Unknown",
                        Answer = "Failed to get answer from AI model.",
                        MatchType = "error",
                        Confidence = 0.0
                    };
                }

                var responseContent = await response.Content.ReadAsStringAsync();
                var result = JsonSerializer.Deserialize<PythonApiResponse>(responseContent);

                if (result == null || !result.success)
                {
                    _logger.LogError("Python API returned unsuccessful response");
                    return new FAQResult
                    {
                        Success = false,
                        Category = "Unknown",
                        Answer = "Failed to process question.",
                        MatchType = "error",
                        Confidence = 0.0
                    };
                }

                _logger.LogInformation($"Python API processed question successfully. Category: {result.category}, Confidence: {result.confidence}");

                return new FAQResult
                {
                    Success = true,
                    Category = result.category,
                    Answer = result.answer,
                    MatchType = result.match_type,
                    Confidence = result.confidence
                };
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Failed to connect to Python API. Make sure it's running on port 5001");
                return new FAQResult
                {
                    Success = false,
                    Category = "Unknown",
                    Answer = "AI service is not available. Please try again later.",
                    MatchType = "error",
                    Confidence = 0.0
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing question with Python API");
                return new FAQResult
                {
                    Success = false,
                    Category = "Unknown",
                    Answer = "An error occurred while processing your question.",
                    MatchType = "error",
                    Confidence = 0.0
                };
            }
        }

        private class PythonApiResponse
        {
            public bool success { get; set; }
            public string category { get; set; } = string.Empty;
            public string answer { get; set; } = string.Empty;
            public string match_type { get; set; } = string.Empty;
            public double confidence { get; set; }
        }
    }

    public class FAQResult
    {
        public bool Success { get; set; }
        public string Category { get; set; } = string.Empty;
        public string Answer { get; set; } = string.Empty;
        public string MatchType { get; set; } = string.Empty;
        public double Confidence { get; set; }
    }
}