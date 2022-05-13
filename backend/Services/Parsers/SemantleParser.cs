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
        private const string _gameName = "Semantle";
        public override string GameName => _gameName;
        public override bool GolfScoring => true;
        private const string ScoreGroup = "score";
        private const string CompletedGroup = "completed";
        protected override Regex Parser => new Regex($"^(?<{CompletedGroup}>.+?){_gameName} #\\d+ in (?<{ScoreGroup}>\\d+) guesses");
        private const string _url = "https://semantle.com/";
        public override string Url => _url;

        protected override string GetCleanResult(string result, Match parserResults)
        {
            return result.Replace(_url, string.Empty).Trim();
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
