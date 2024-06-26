using System.Text.RegularExpressions;
using backend.Models;

namespace backend.Services.Parsers
{
    public class ArtleParser : BasicScoreResultParser
    {
        private ILogger<ArtleParser> _logger;

        public ArtleParser(ILogger<ArtleParser> logger) : base(logger)
        {
            _logger = logger;
        }

        public override bool CountWinner => true;
        public override string GameName => "Artle";
        public override string? HelpText => null;
        // \uD83C\uDFA8 = 🎨
        // \uD83D\uDFE9 = 🟩
        // \uD83D\uDFE5 = 🟥
        // \u2B1C\uFE0F = ⬜️
        protected override Regex Parser => new Regex($"{GameName} #\\d+.*?\uD83C\uDFA8(?<{ScoreGroup}>[^\\n]+)", RegexOptions.Singleline);
        protected override string? ExtraContent => Url;
        public override string Url => "https://www.nga.gov/Artle";

        protected override DailyResult SetScore(DailyResult dailyResult, Match parserResults)
        {
            if (!parserResults.Groups.ContainsKey(ScoreGroup))
            {
                return dailyResult;
            }

            var result = parserResults.Groups[ScoreGroup].Value.Replace(" ", string.Empty);
            var successIndex = result.IndexOf("🟩");
            if (successIndex > -1)
            {
                dailyResult.Score = (successIndex + "🟩".Length) / 2;
            }

            return dailyResult;
        }
    }
}
