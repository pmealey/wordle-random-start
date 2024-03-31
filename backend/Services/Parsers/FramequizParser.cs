using System.Text.RegularExpressions;
using backend.Models;

namespace backend.Services.Parsers
{
    public class FramequizParser : BasicScoreResultParser
    {
        private ILogger<FramequizParser> _logger;

        public FramequizParser(ILogger<FramequizParser> logger) : base(logger)
        {
            _logger = logger;
        }

        public override bool CountWinner => false;
        public override string GameName => "Framequiz";
        public override string? HelpText => null;
        // \uD83D\uDFE9 = 🟩
        // \uD83D\uDFE5 = 🟥
        // \u2B1B\uFE0F = ⬛️
        protected override Regex Parser => new Regex($"{GameName} .+?(?<{ScoreGroup}>[\uD83D\uDFE9\uDFE5\u2B1B\uFE0F ]{{2,}})", RegexOptions.Singleline);
        protected override string? ExtraContent => $" - {Url}";
        public override string Url => "https://framequiz.com";

        protected override DailyResult SetScore(DailyResult dailyResult, Match parserResults)
        {
            if (!parserResults.Groups.ContainsKey(ScoreGroup))
            {
                return dailyResult;
            }

            var score = parserResults.Groups[ScoreGroup].Value.Trim().Replace(" ", string.Empty);

            var successIndex = score.IndexOf("🟩");
            if (successIndex > -1)
            {
                dailyResult.Score = (successIndex + "🟩".Length) / 2;
            }

            return dailyResult;
        }
    }
}
