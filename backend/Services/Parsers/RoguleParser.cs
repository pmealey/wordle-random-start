using System.Text.RegularExpressions;
using backend.Models;

namespace backend.Services.Parsers
{
    public class RoguleParser : ResultParser
    {
        private ILogger<RoguleParser> _logger;

        public RoguleParser(ILogger<RoguleParser> logger) : base(logger)
        {
            _logger = logger;
        }

        public override bool CountWinner => false;
        public override string GameName => "Rogule";
        public override bool GolfScoring => false;
        public override string? HelpText => "Doesn't count towards the daily leaderboard.";
        protected override Regex Parser => new Regex($"#{GameName}");
        public override string Url => "https://rogule.com";

        protected override string GetCleanResult(string result, Match parserResults)
        {
            return result
                .Replace(Url, string.Empty).Trim()
                .Replace(Url + "/", string.Empty).Trim();
        }

        public override string? GetScoreValue(DailyResult dailyResult)
        {
            return dailyResult.Score?.ToString();
        }

        protected override DailyResult SetScore(DailyResult dailyResult, Match parserResults)
        {
            if (dailyResult.Result.Contains('⛩'))
            {
                dailyResult.Score = 1;
            }
            else
            {
                dailyResult.Score = 0;
            }

            return dailyResult;
        }
    }
}
