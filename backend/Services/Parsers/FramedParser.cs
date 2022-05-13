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

        private const string _gameName = "Framed";
        public override string GameName => _gameName;
        // \uD83C\uDFA5 = 🎥
        // \uD83D\uDFE9 = 🟩
        // \uD83D\uDFE8 = 🟨
        // \uD83D\uDFE5 = 🟥
        // \u2B1C\uFE0F = ⬜️
        // \u2B1B\uFE0F = ⬛️
        private readonly Regex _parser = new Regex($"{_gameName} #\\d+\n\uD83C\uDFA5(?<{ScoreGroup}>[^\n]*)", RegexOptions.Singleline);
        protected override Regex Parser => _parser;
        protected override string? ExtraContent => _url;
        private const string _url = "https://framed.wtf";
        public override string Url => _url;

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
