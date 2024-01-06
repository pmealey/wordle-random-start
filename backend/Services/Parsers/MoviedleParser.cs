using System.Text.RegularExpressions;
using backend.Models;

namespace backend.Services.Parsers
{
    public class MoviedleParser : BasicScoreResultParser
    {
        private ILogger<MoviedleParser> _logger;

        public MoviedleParser(ILogger<MoviedleParser> logger) : base(logger)
        {
            _logger = logger;
        }

        public override bool CountWinner => false;
        public override bool Default => false;
        public override string GameName => "Moviedle";
        public override string? HelpText => null;
        // \uD83C\uDFA5 = 🎥
        // \uD83D\uDFE9 = 🟩
        // \uD83D\uDFE8 = 🟨
        // \uD83D\uDFE5 = 🟥
        // \u2B1C\uFE0F = ⬜️
        // \u2B1B\uFE0F = ⬛️
        protected override Regex Parser => new Regex($"#{GameName} #[\\d-]+.*?\n\n\\s*\uD83C\uDFA5(?<{ScoreGroup}>[^\n]*)", RegexOptions.Singleline);
        protected override string? ExtraContent => Url;
        public override string Url => "https://moviedle.app";

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
