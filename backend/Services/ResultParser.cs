using System.Text.RegularExpressions;
using backend.Models;

namespace backend.Services
{
    public abstract class ResultParser
    {
        private ILogger<ResultParser> _logger;

        public ResultParser(ILogger<ResultParser> logger)
        {
            _logger = logger;
        }

        public abstract bool CountWinner { get; }

        public abstract string GameName { get; }

        public abstract bool GolfScoring { get; }

        public abstract string? HelpText { get; }

        public virtual DateTime HideAfter => DateTime.MaxValue;

        protected abstract Regex Parser { get; }

        public abstract string? Url { get; }

        protected abstract string GetCleanResult(string result, Match parserResults);

        public abstract string? GetScoreValue(DailyResult dailyResult);

        protected abstract DailyResult SetScore(DailyResult dailyResult, Match parserResults);

        public bool TryParse(string user, DateTime date, string result, out DailyResult? dailyResult)
        {
            dailyResult = null;
            var parserResults = Parser.Match(result);
            if (!parserResults.Success)
            {
                _logger.LogDebug($"This game is not {GameName}.");
                return false;
            }

            var cleanResult = result;

            cleanResult = GetCleanResult(cleanResult, parserResults);

            // automatically strip out the URL
            if (Url != null)
            {
                if (!Url.EndsWith("/"))
                {
                    cleanResult = cleanResult.Replace(Url + "/", string.Empty);
                }

                cleanResult = cleanResult.Replace(Url, string.Empty);
            }

            // automatically strip out extra space
            cleanResult = new Regex("\\n{3,}").Replace(cleanResult, "\n\n");

            cleanResult = cleanResult.Trim();

            dailyResult = new DailyResult
            {
                Date = date.Date,
                Game = GameName,
                Result = cleanResult,
                User = user
            };

            dailyResult = SetScore(dailyResult, parserResults);

            _logger.LogDebug($"This game is {GameName}."); 

            return true;
        }
    }
}
