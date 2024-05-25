using System.Text.RegularExpressions;
using backend.Models;

namespace backend.Services.Parsers
{
    public class TravleParser : BasicScoreResultParser
    {
        private ILogger<TravleParser> _logger;

        public TravleParser(ILogger<TravleParser> logger) : base(logger)
        {
            _logger = logger;
        }

        public override bool CountWinner => true;
        public override string? HelpText => null;
        public override string GameName => "Travle";
        protected override Regex Parser => new Regex($@"#{GameName.ToLower()} #\d+ \+?(?<{ScoreGroup}>\d*)");
        protected override string? ExtraContent => Url;
        public override string Url => "https://travle.earth";

        protected override DailyResult SetScore(DailyResult dailyResult, Match parserResults) {
            var newResult = base.SetScore(dailyResult, parserResults);

            if (dailyResult.Result != null && dailyResult.Result.Contains("(Perfect)")) {
                newResult.Score = -1;
            }

            return newResult;
        }
    }
}
