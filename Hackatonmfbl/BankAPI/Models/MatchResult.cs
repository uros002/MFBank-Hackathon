namespace BankAPI.Models
{
    public class MatchResult
    {
        public string Category { get; set; } = string.Empty;
        public string Answer { get; set; } = string.Empty;
        public string MatchType { get; set; } = string.Empty;
        public double Confidence { get; set; }
        public string? MatchedQuestion { get; set; }
    }
}