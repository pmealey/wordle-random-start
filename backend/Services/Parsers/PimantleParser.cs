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
        public override string GameName => "Pimantle";
        public override bool GolfScoring => true;
        public override string? HelpText => null;
        private const string ScoreGroup = "score";
        private const string HintGroup = "hint";
        protected override Regex Parser => new Regex($"^I solved {GameName} #\\d+ with (?<{ScoreGroup}>\\d+) guesses and ((?<{HintGroup}>\\d+)|no) hints");
        public override string Url => "https://semantle.pimanrul.es/";

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
            if (!parserResults.Groups.ContainsKey(ScoreGroup) ||
                !Int32.TryParse(parserResults.Groups[ScoreGroup].Value, out var score))
            {
                return dailyResult;
            }
            
            var scores = new List<int>();
            if (parserResults.Groups.ContainsKey(HintGroup) && Int32.TryParse(parserResults.Groups[HintGroup].Value, out var hints))
            {
                scores.Add(hints);
            }

            scores.Add(score);

            dailyResult.Scores = scores;

            return dailyResult;
        }
    }
}
