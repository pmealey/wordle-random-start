using System.Text.RegularExpressions;
using backend.Models;

namespace backend.Services.Parsers
{
    public class FramedParser : BasicScoreResultParser
    {
        private ILogger<FramedParser> _logger;

        public FramedParser(ILogger<FramedParser> logger) : base(logger)
        {
            _logger = logger;
        }

        public override DateTime ActiveAfter => DateTime.MinValue;
        public override string Category => "Media";
        public override string GameName => "Framed";
        public override string? HelpText => null;
        // \uD83C\uDFA5 = 🎥
        // \uD83D\uDFE9 = 🟩
        // \uD83D\uDFE8 = 🟨
        // \uD83D\uDFE5 = 🟥
        // \u2B1C\uFE0F = ⬜️
        // \u2B1B\uFE0F = ⬛️
        protected override Regex Parser => new Regex($"{GameName} #\\d+\n\uD83C\uDFA5(?<{ScoreGroup}>[^\n]*)", RegexOptions.Singleline);
        protected override string? ExtraContent => Url;
        public override string Url => "https://framed.wtf";

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
