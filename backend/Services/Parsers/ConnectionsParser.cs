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

        protected override Regex Parser => new Regex($@"^{GameName}\s*Puzzle #\d+(?<{ScoreGroup}>.*)$", RegexOptions.Singleline);
        public override string Url => "https://www.nytimes.com/games/connections";

        protected override string GetCleanResult(string result, Match parserResults)
        {
            return result;
        }

        protected override DailyResult SetScore(DailyResult dailyResult, Match parserResults)
        {
            if (!parserResults.Groups.ContainsKey(ScoreGroup)) {
                return dailyResult;
            }

            var scoreRows = parserResults.Groups[ScoreGroup]
                .Value
                .Split('\n')
                .Where(row => !string.IsNullOrEmpty(row))
                .Select(row => row.Trim())
                .ToArray();

            var totalGuesses = scoreRows.Length;

            var correctRows = scoreRows
                .Where(row => {
                    var rowParts = new List<string>();
                    for (var i = 0; i < row.Length - 1; i += 2) {
                        rowParts.Add(row.Substring(i, 2));
                    }
                    return rowParts.Distinct().Count() == 1;
                })
                .Count();

            // the score is the total number of guesses plus the number of categories that were not successfully guessed
            dailyResult.Score = totalGuesses + (4 - correctRows);

            return dailyResult;
        }
    }
}
