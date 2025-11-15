using System.Text.RegularExpressions;
using backend.Models;

namespace backend.Services.Parsers
{
    public class SemantleParser : ResultParser
    {
        private ILogger<SemantleParser> _logger;

        public SemantleParser(ILogger<SemantleParser> logger) : base(logger)
        {
            _logger = logger;
        }

        public override bool CountWinner => true;
        public override string GameName => "Semantle";
        public override bool GolfScoring => true;
        public override string? HelpText => null;
        private const string ScoreGroup = "score";
        private const string CompletedGroup = "completed";
        private const string HintsGroup = "hints";
        protected override Regex Parser => new Regex($"{GameName} #\\d+.*?(?<{CompletedGroup}>✅|❌).*?(?<{ScoreGroup}>\\d+) Guesse?s?.*?💡 (?<{HintsGroup}>\\d+) Hints?", RegexOptions.Singleline);
        public override string Url => "https://semantle.com";

        protected override string GetCleanResult(string result, Match parserResults)
        {
            return result
                .Replace(Url, string.Empty)
                .Replace(Url.Replace("https://", string.Empty), string.Empty)
                .Trim();
        }

        public override string? GetScoreValue(DailyResult dailyResult)
        {
            return dailyResult.Score?.ToString();
        }

        protected override DailyResult SetScore(DailyResult dailyResult, Match parserResults)
        {
            // gave up, no score
            if (parserResults.Groups[CompletedGroup].Value == "❌")
            {
                return dailyResult;
            }

            if (parserResults.Groups.ContainsKey(HintsGroup) && int.TryParse(parserResults.Groups[HintsGroup].Value, out var hints))
            {
                dailyResult.Score = hints * 10000;
            }
            else
            {
                dailyResult.Score = 0;
            }

            if (parserResults.Groups.ContainsKey(ScoreGroup) && int.TryParse(parserResults.Groups[ScoreGroup].Value, out var score))
            {
                dailyResult.Score += score;
            }

            return dailyResult;
        }
    }
}
