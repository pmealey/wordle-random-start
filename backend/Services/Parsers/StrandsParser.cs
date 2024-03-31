using System.Text.RegularExpressions;
using backend.Models;

namespace backend.Services.Parsers
{
    public class StrandsParser : BasicScoreResultParser
    {
        private ILogger<StrandsParser> _logger;

        public StrandsParser(ILogger<StrandsParser> logger) : base(logger)
        {
            _logger = logger;
        }

        public override bool CountWinner => true;
        public override bool Default => false;
        public override string GameName => "Strands";
        public override string? HelpText => null;
        // \uD83D\uDCA1 = 💡
        // \uD83D\uDD35 = 🔵
        // \uD83D\uDFE1 = 🟡
        protected override Regex Parser => new Regex($"{GameName} .+?(?<{ScoreGroup}>[\uD83D\uDCA1\uDD35\uDFE1\n]{{2,}})", RegexOptions.Singleline);
        protected override string? ExtraContent => null;
        public override string Url => "https://www.nytimes.com/games/strands";

        protected override DailyResult SetScore(DailyResult dailyResult, Match parserResults)
        {
            if (!parserResults.Groups.ContainsKey(ScoreGroup))
            {
                return dailyResult;
            }

            dailyResult.Score = parserResults.Groups[ScoreGroup].Value
                .Trim()
                .Replace("\n", string.Empty)
                .Split("💡")
                .Length - 1;

            return dailyResult;
        }
    }
}
