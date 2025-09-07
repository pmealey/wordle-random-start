using System.Text.RegularExpressions;
using backend.Models;

namespace backend.Services.Parsers
{
    public class MinuteCrypticParser : BasicScoreResultParser
    {
        private ILogger<MinuteCrypticParser> _logger;

        public MinuteCrypticParser(ILogger<MinuteCrypticParser> logger) : base(logger)
        {
            _logger = logger;
        }

        public override bool CountWinner => true;
        public override string GameName => "Minute Cryptic";
        public override string? HelpText => null;
        // ⚪️
        // 🟣 = \uD83D\uDFE3
        // 🟡 = \uD83D\uDFE1
        protected override Regex Parser => new Regex($"{GameName}.+?(?<{ScoreGroup}>(⚪️|🟡|🟣)+)", RegexOptions.Singleline);
        protected override string? ExtraContent => Url + "/?utm_source=share";
        public override string Url => "https://www.minutecryptic.com";
        protected override DailyResult SetScore(DailyResult dailyResult, Match parserResults)
        {
            if (!parserResults.Groups.ContainsKey(ScoreGroup))
            {
                return dailyResult;
            }

            var successIndex = parserResults.Groups[ScoreGroup].Value.IndexOf("🟣");
            if (successIndex > -1)
            {
                dailyResult.Score = successIndex / 2;
            }

            return dailyResult;
        }
    }
}
