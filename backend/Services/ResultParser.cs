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

        public abstract int Priority { get; }

        public abstract string GameName { get; }

        protected abstract Regex Parser { get; }

        protected abstract string GetCleanResult(string result, Match parserResults);

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

            var cleanResult = GetCleanResult(result, parserResults);

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
