using System.Text.RegularExpressions;
using backend.Models;

namespace backend.Services.Parsers
{
    public class RaddleParser : BasicScoreResultParser
    {
        private ILogger<RaddleParser> _logger;

        public RaddleParser(ILogger<RaddleParser> logger) : base(logger)
        {
            _logger = logger;
        }

        public override bool GolfScoring => false;
        public override bool CountWinner => true;
        public override string GameName => "Raddle";
        public override string? HelpText => null;
        protected override Regex Parser => new Regex($".+?\\[(?<{ScoreGroup}>.+?)\\].*?{GameName}", RegexOptions.Singleline);
        protected override string? ExtraContent => null;
        public override string Url => "https://raddle.quest";

        protected override DailyResult SetScore(DailyResult dailyResult, Match parserResults)
        {
            if (!parserResults.Groups.ContainsKey(ScoreGroup))
            {
                return dailyResult;
            }

            var stringScore = parserResults.Groups[ScoreGroup].Value;

            if (stringScore == "💯")
            {
                dailyResult.Score = 100;
            }

            if (stringScore.EndsWith('%'))
            {
                stringScore = stringScore.Replace("%", string.Empty);
            }

            if (int.TryParse(stringScore, out var score))
            {
                dailyResult.Score = score;
            }

            return dailyResult;
        }
    }
}
