using System.Text.RegularExpressions;
using backend.Models;

namespace backend.Services.Parsers
{
    public class RedactleParser : ResultParser
    {
        private ILogger<RedactleParser> _logger;

        public RedactleParser(ILogger<RedactleParser> logger) : base(logger)
        {
            _logger = logger;
        }

        public override bool CountWinner => true;
        private const string _gameName = "Redactle";
        public override string GameName => _gameName;
        public override bool GolfScoring => true;
        private const string ScoreGroup = "score";
        protected override Regex Parser => new Regex($"^I solved today's #{_gameName} \\(#\\d\\) in (?<{ScoreGroup}>\\d+) guesses");
        private const string _url = "https://www.redactle.com/";
        public override string Url => _url;

        protected override string GetCleanResult(string result, Match parserResults)
        {
            return result.Trim();
        }

        public override string? GetScoreValue(DailyResult dailyResult)
        {
            return dailyResult.Score?.ToString();
        }

        protected override DailyResult SetScore(DailyResult dailyResult, Match parserResults)
        {
            if (Int32.TryParse(parserResults.Groups[ScoreGroup].Value, out var score))
            {
                dailyResult.Score = score;
            }

            return dailyResult;
        }
    }
}
