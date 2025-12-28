namespace BankAPI.DTOs
{
    public class QuestionDto
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string Name { get; set; } = string.Empty;
        public string Surname { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Office { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string Question { get; set; } = string.Empty;
        public string SuggestedAnswer { get; set; } = string.Empty;
        public string MatchType { get; set; } = string.Empty;
        public double Confidence { get; set; }
        public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;
        public bool IsAnswered { get; set; } = false;
        public bool IsHighAlert { get; set; } = false;
        public int TimeLeftMinutes { get; set; } = 15;
        
        // New fields for answered questions
        public DateTime? AnsweredAt { get; set; }
        public string OperatorAnswer { get; set; } = string.Empty;
    }
}