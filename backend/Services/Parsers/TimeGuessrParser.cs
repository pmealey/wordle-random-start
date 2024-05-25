using System.Text.RegularExpressions;
using backend.Models;

namespace backend.Services.Parsers
{
    public class TimeGuessrParser : BasicScoreResultParser
    {
        private ILogger<TimeGuessrParser> _logger;

        public TimeGuessrParser(ILogger<TimeGuessrParser> logger) : base(logger)
        {
            _logger = logger;
        }

        public override bool CountWinner => true;
        public override string GameName => "TimeGuessr";
        public override bool GolfScoring => false;
        public override string? HelpText => null;
        protected override Regex Parser => new Regex($@"{GameName} #\d+ (?<{ScoreGroup}>[\d|,|.]+)", RegexOptions.Singleline);
        protected override string? ExtraContent => Url;
        public override string Url => "https://timeguessr.com";

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
