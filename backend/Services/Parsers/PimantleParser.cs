using System.Text.RegularExpressions;
using backend.Models;

namespace backend.Services.Parsers
{
    public class PimantleParser : ResultParser
    {
        private ILogger<PimantleParser> _logger;

        public PimantleParser(ILogger<PimantleParser> logger) : base(logger)
        {
            _logger = logger;
        }

        public override bool CountWinner => true;
        private const int _priority = 12;
        public override int Priority => _priority;
        private const string _gameName = "Pimantle";
        public override string GameName => _gameName;
        public override bool GolfScoring => true;
        private const string ScoreGroup = "score";
        protected override Regex Parser => new Regex($"^I solved {_gameName} #\\d+ with (?<{ScoreGroup}>\\d+) guesses");
        private const string _url = "https://semantle.pimanrul.es/";
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
            if (Int32.TryParse(parserResults.Groups[ScoreGroup].Value, out var score))
            {
                dailyResult.Score = score;
            }

            return dailyResult;
        }
    }
}
