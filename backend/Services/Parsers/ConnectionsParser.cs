using System.Text.RegularExpressions;
using backend.Models;

namespace backend.Services.Parsers
{
    public class ConnectionsParser : BasicScoreResultParser
    {
        private ILogger<ConnectionsParser> _logger;

        public ConnectionsParser(ILogger<ConnectionsParser> logger) : base(logger)
        {
            _logger = logger;
        }

        public override bool CountWinner => true;
        public override bool Default => false;
        protected override string? ExtraContent => null;
        public override string GameName => "Connections";
        public override string? HelpText => null;

        protected override Regex Parser => new Regex($"{GameName}\nPuzzle #[\\d]+\n(?<{ScoreGroup}>.*)");
        public override string Url => "https://www.nytimes.com/games/connections";

        public override string? GetScoreValue(DailyResult dailyResult)
        {
            return dailyResult.Scores == null || dailyResult.Scores.Count != 4 ? null : dailyResult.Scores.Average().ToString();
        }

        protected override DailyResult SetScore(DailyResult dailyResult, Match parserResults)
        {
            var scoreRows = parserResults.Groups[ScoreGroup]
                .Value
                .Split('\n');

            var totalGuesses = scoreRows.Length;

            var correctRows = scoreRows
                .Where(row => row.Distinct().Count() == 1)
                .Count();

            // the score is the total number of guesses plus the number of categories that were not successfully guessed
            dailyResult.Score = totalGuesses + (4 - correctRows);

            return dailyResult;
        }
    }
}
