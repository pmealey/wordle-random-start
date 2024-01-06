using System.Text.RegularExpressions;
using backend.Models;

namespace backend.Services.Parsers
{
    public class WeaverParser : BasicScoreResultParser
    {
        private ILogger<WeaverParser> _logger;

        public WeaverParser(ILogger<WeaverParser> logger) : base(logger)
        {
            _logger = logger;
        }

        public override bool CountWinner => false;
        public override bool Default => false;
        public override string GameName => "Weaver";
        public override string? HelpText => null;
        // \uD83D\uDFE9 = 🟩
        // \u2B1C\uFE0F = ⬜️
        protected override Regex Parser => new Regex($"{GameName}[^a-zA-Z]+[a-zA-Z]+\n(?<{ScoreGroup}>[^a-zA-Z]+)", RegexOptions.Singleline);
        protected override string? ExtraContent => null;
        public override string Url => "https://wordwormdormdork.com/";

        protected override DailyResult SetScore(DailyResult dailyResult, Match parserResults)
        {
            if (!parserResults.Groups.ContainsKey(ScoreGroup))
            {
                return dailyResult;
            }

            var scoreLines = parserResults.Groups[ScoreGroup].Value;
            if (!string.IsNullOrWhiteSpace(scoreLines))
            {
                dailyResult.Score = scoreLines.Where(c => c == '\n').Count();
            }

            return dailyResult;
        }
    }
}
