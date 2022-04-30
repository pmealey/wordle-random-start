using System.Text.RegularExpressions;
using backend.Models;

namespace backend.Services.Parsers
{
    public class HeardleParser : BasicScoreResultParser
    {
        private ILogger<HeardleParser> _logger;

        public HeardleParser(ILogger<HeardleParser> logger) : base(logger)
        {
            _logger = logger;
        }

        private const int _priority = 8;
        public override int Priority => _priority;
        private const string _gameName = "Heardle";
        public override string GameName => _gameName;
        // \uD83D\uDD07 = 🔇
        // \uD83D\uDD08 = 🔈
        // \uD83D\uDD09 = 🔉
        // \UD83D\uDD0A = 🔊
        // \uD83D\uDFE9 = 🟩
        // \uD83D\uDFE8 = 🟨
        // \uD83D\uDFE5 = 🟥
        // \u2B1C\uFE0F = ⬜️
        // \u2B1B\uFE0F = ⬛️
        private readonly Regex _parser = new Regex($"#{_gameName} #\\d+\\s+\uD83D[\uDD07-\uDD0A](?<{ScoreGroup}>[^\\s]+)", RegexOptions.Singleline);
        protected override Regex Parser => _parser;
        protected override string? ExtraContent => _url;
        private const string _url = "https://heardle.app";
        public override string Url => _url;

        protected override DailyResult SetScore(DailyResult dailyResult, Match parserResults)
        {
            if (!parserResults.Groups.ContainsKey(ScoreGroup))
            {
                return dailyResult;
            }

            var successIndex = parserResults.Groups[ScoreGroup].Value.IndexOf("🟩");
            if (successIndex > -1)
            {
                dailyResult.Score = (successIndex + "🟩".Length) / 2;
            }

            return dailyResult;
        }
    }
}
