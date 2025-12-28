using System.Text.RegularExpressions;
using System.Text.Json;
using BankAPI.Models;

namespace BankAPI.Services
{
    public class FAQMatcher
    {
        private FAQExport? _data;
        private const double DEFAULT_THRESHOLD = 0.55;

        public void LoadData(string jsonFilePath)
        {
            try
            {
                string jsonContent = File.ReadAllText(jsonFilePath);
                _data = JsonSerializer.Deserialize<FAQExport>(jsonContent);
                Console.WriteLine($"✓ Loaded {_data?.total_questions} questions");
            }
            catch (Exception ex)
            {
                throw new Exception($"Failed to load FAQ data: {ex.Message}");
            }
        }

        private string Normalize(string text)
        {
            if (string.IsNullOrWhiteSpace(text))
                return string.Empty;

            text = text.ToLower().Trim();
            text = Regex.Replace(text, @"\s+", " ");
            return text;
        }

        private double CalculateSimilarity(string str1, string str2)
        {
            int maxLen = Math.Max(str1.Length, str2.Length);
            if (maxLen == 0) return 1.0;

            int distance = LevenshteinDistance(str1, str2);
            return 1.0 - (double)distance / maxLen;
        }

        private int LevenshteinDistance(string s1, string s2)
        {
            int[,] d = new int[s1.Length + 1, s2.Length + 1];

            for (int i = 0; i <= s1.Length; i++)
                d[i, 0] = i;

            for (int j = 0; j <= s2.Length; j++)
                d[0, j] = j;

            for (int j = 1; j <= s2.Length; j++)
            {
                for (int i = 1; i <= s1.Length; i++)
                {
                    int cost = (s1[i - 1] == s2[j - 1]) ? 0 : 1;
                    d[i, j] = Math.Min(
                        Math.Min(d[i - 1, j] + 1, d[i, j - 1] + 1),
                        d[i - 1, j - 1] + cost
                    );
                }
            }

            return d[s1.Length, s2.Length];
        }

        public MatchResult? FindExactMatch(string question)
        {
            if (_data == null) return null;
            
            string normalized = Normalize(question);

            foreach (var item in _data.index)
            {
                if (item.normalized_question == normalized)
                {
                    return new MatchResult
                    {
                        Category = item.category,
                        Answer = item.answer,
                        MatchType = "exact",
                        Confidence = 1.0,
                        MatchedQuestion = item.original_question
                    };
                }
            }

            return null;
        }

        public MatchResult? FindBestMatch(string question, double threshold = DEFAULT_THRESHOLD)
        {
            if (_data == null) return null;

            string normalized = Normalize(question);
            double bestScore = 0;
            FAQIndex? bestMatch = null;

            foreach (var item in _data.index)
            {
                double score = CalculateSimilarity(normalized, item.normalized_question);

                if (score > bestScore)
                {
                    bestScore = score;
                    bestMatch = item;
                }
            }

            if (bestScore < threshold || bestMatch == null)
                return null;

            return new MatchResult
            {
                Category = bestMatch.category,
                Answer = bestMatch.answer,
                MatchType = "similar",
                Confidence = Math.Round(bestScore, 2),
                MatchedQuestion = bestMatch.original_question
            };
        }

        public MatchResult ProcessQuestion(string question, string? manualCategory = null)
        {
            question = question?.Trim() ?? string.Empty;

            if (!string.IsNullOrWhiteSpace(manualCategory))
            {
                return new MatchResult
                {
                    Category = manualCategory,
                    Answer = "Category provided manually. Operator should review.",
                    MatchType = "manual",
                    Confidence = 0.0,
                    MatchedQuestion = null
                };
            }

            var exactMatch = FindExactMatch(question);
            if (exactMatch != null)
                return exactMatch;

            var similarMatch = FindBestMatch(question);
            if (similarMatch != null)
                return similarMatch;

            return new MatchResult
            {
                Category = "Unknown",
                Answer = "No quick answer found. Requires operator review.",
                MatchType = "none",
                Confidence = 0.0,
                MatchedQuestion = null
            };
        }
    }
}