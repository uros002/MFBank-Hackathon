namespace BankAPI.Models
{
    public class QuestionRequest
    {
        public string Name { get; set; } = string.Empty;
        public string Surname { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Office { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string Question { get; set; } = string.Empty;
    }
}