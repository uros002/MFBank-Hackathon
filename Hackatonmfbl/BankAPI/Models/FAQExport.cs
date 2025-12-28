namespace BankAPI.Models
{
    public class FAQIndex
    {
        public string original_question { get; set; } = string.Empty;
        public string normalized_question { get; set; } = string.Empty;
        public string category { get; set; } = string.Empty;
        public string answer { get; set; } = string.Empty;
    }

    public class FAQExport
    {
        public List<FAQIndex> index { get; set; } = new();
        public List<string> categories { get; set; } = new();
        public int total_questions { get; set; }
    }
}