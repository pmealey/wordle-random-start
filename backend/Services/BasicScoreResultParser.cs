using System.Text.RegularExpressions;
using backend.Models;

namespace backend.Services
{
    public abstract class BasicScoreResultParser : ResultParser
    {
        private ILogger<BasicScoreResultParser> _logger;

        public BasicScoreResultParser(ILogger<BasicScoreResultParser> logger) : base(logger)
        {
            _logger = logger;
        }

        public override bool GolfScoring => true;
        protected const string ScoreGroup = "score";
        protected abstract string? ExtraContent { get; }

        protected override string GetCleanResult(string result, Match parserResults)
        {
            if (string.IsNullOrWhiteSpace(ExtraContent))
            {
                return result.Trim();
            }
            else
            {
                return result.Replace(ExtraContent, string.Empty).Trim();
            }
        }

        public override string? GetScoreValue(DailyResult dailyResult)
        {
            return dailyResult.Score?.ToString();
        }

        protected override DailyResult SetScore(DailyResult dailyResult, Match parserResults)
        {
            if (!parserResults.Groups.ContainsKey(ScoreGroup))
            {
                return dailyResult;
            }

            if (int.TryParse(parserResults.Groups[ScoreGroup].Value, out var score))
            {
                dailyResult.Score = score;
            }

            return dailyResult;
        }
    }
}
