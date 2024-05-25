using System.Text.RegularExpressions;
using backend.Models;

namespace backend.Services.Parsers
{
    public class FoodGuessrParser : BasicScoreResultParser
    {
        private ILogger<FoodGuessrParser> _logger;

        public FoodGuessrParser(ILogger<FoodGuessrParser> logger) : base(logger)
        {
            _logger = logger;
        }

        public override bool CountWinner => true;
        public override string GameName => "FoodGuessr";
        public override bool GolfScoring => false;
        public override string? HelpText => null;
        protected override Regex Parser => new Regex($@"{GameName} .+?Total score: (?<{ScoreGroup}>[\d|,|.]+)", RegexOptions.Singleline);
        protected override string? ExtraContent => null;
        public override string Url => "https://foodguessr.com";

        protected override string GetCleanResult(string result, Match parserResults)
        {
            var index = result.IndexOf("Can you beat my score? New game daily!");
            if (index > -1) {
                return result.Substring(0, index).Trim();
            }

            return result;
        }

        protected override DailyResult SetScore(DailyResult dailyResult, Match parserResults)
        {
            if (!parserResults.Groups.ContainsKey(ScoreGroup))
            {
                return dailyResult;
            }

            var scoreString = parserResults.Groups[ScoreGroup].Value
                .Replace(",", string.Empty)
                .Replace(".", string.Empty);
            if (int.TryParse(scoreString, out var score))
            {
                dailyResult.Score = score;
            }

            return dailyResult;
        }
    }
}
