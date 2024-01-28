using System.Text.RegularExpressions;
using backend.Models;

namespace backend.Services.Parsers
{
    public class ContextoParser : ResultParser
    {
        private ILogger<ContextoParser> _logger;

        public ContextoParser(ILogger<ContextoParser> logger) : base(logger)
        {
            _logger = logger;
        }

        public override bool CountWinner => false;
        public override bool Default => false;
        public override string GameName => "Contexto";
        public override bool GolfScoring => true;
        public override string? HelpText => null;
        private const string CompletedGroup = "completed";
        private const string ScoreGroup = "score";
        private const string HintGroup = "hint";
        protected override Regex Parser => new Regex($@"^I played contexto.me #\d+ (?<{CompletedGroup}>[^\d]+)(?<{ScoreGroup}>\d+) guesses( and (?<{HintGroup}>\d+) hints)?");
        public override string Url => "https://contexto.me/";

        protected override string GetCleanResult(string result, Match parserResults)
        {
            return result.Trim();
        }

        public override string? GetScoreValue(DailyResult dailyResult)
        {
            if (dailyResult.Scores == null)
            {
                return null;
            }

            if (dailyResult.Scores.Count == 1)
            {
                return dailyResult.Scores.Single().ToString();
            }

            return "\"" + string.Join(",", dailyResult.Scores
                .Select((i) => dailyResult.Scores[i].ToString())) + "\"";
        }

        protected override DailyResult SetScore(DailyResult dailyResult, Match parserResults)
        {
            if (!parserResults.Groups.ContainsKey(CompletedGroup) ||
                !parserResults.Groups.ContainsKey(ScoreGroup) ||
                !Int32.TryParse(parserResults.Groups[ScoreGroup].Value, out var score) ||
                // gave up, no score
                parserResults.Groups[CompletedGroup].Value.StartsWith("but I gave up in"))
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
