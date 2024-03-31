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

        public override bool CountWinner => false;
        public override string GameName => "Redactle";
        public override bool GolfScoring => true;
        public override string? HelpText => null;
        private const string ScoreGroup = "score";
        protected override Regex Parser => new Regex($@"^I solved {GameName} #\d+ in (?<{ScoreGroup}>\d+) guesses");
        public override string Url => "https://redactle.net/";

        protected override string GetCleanResult(string result, Match parserResults)
        {
            return result.Replace($"Play at {Url}", string.Empty).Trim();
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
