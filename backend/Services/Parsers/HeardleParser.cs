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
        private readonly Regex _parser = new Regex($"#{_gameName} #\\d+[\\s\\r\\n]+🔉(?<{ScoreGroup}>[🟥🟩]+)");
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

            if (parserResults.Groups[ScoreGroup].Value.Length > 0 && parserResults.Groups[ScoreGroup].Value.EndsWith("🟩"))
            {
                dailyResult.Score = parserResults.Groups[ScoreGroup].Value.Length / 2;
            }

            return dailyResult;
        }
    }
}
