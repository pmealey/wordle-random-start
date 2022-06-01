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

        public override DateTime ActiveAfter => DateTime.MinValue;
        public override string Category => "Madness Inducing";
        public override bool CountWinner => true;
        public override string GameName => "Semantle";
        public override bool GolfScoring => true;
        public override string? HelpText => null;
        private const string ScoreGroup = "score";
        private const string CompletedGroup = "completed";
        protected override Regex Parser => new Regex($"^(?<{CompletedGroup}>.+?){GameName} #\\d+ in (?<{ScoreGroup}>\\d+) guesses");
        public override string Url => "https://semantle.com/";

        protected override string GetCleanResult(string result, Match parserResults)
        {
            return result.Replace(Url, string.Empty).Trim();
        }

        public override string? GetScoreValue(DailyResult dailyResult)
        {
            return dailyResult.Score?.ToString();
        }

        protected override DailyResult SetScore(DailyResult dailyResult, Match parserResults)
        {
            // gave up, no score
            if (parserResults.Groups[CompletedGroup].Value.StartsWith("I gave up on"))
            {
                return dailyResult;
            }

            if (Int32.TryParse(parserResults.Groups[ScoreGroup].Value, out var score))
            {
                dailyResult.Score = score;
            }

            return dailyResult;
        }
    }
}
