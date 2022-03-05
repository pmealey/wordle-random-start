using System.Text.RegularExpressions;

namespace backend.Services.Parsers
{
    public class GlobleParser : BasicScoreResultParser
    {
        private ILogger<GlobleParser> _logger;

        public GlobleParser(ILogger<GlobleParser> logger) : base(logger)
        {
            _logger = logger;
        }

        private const int _priority = 2;
        public override int Priority => _priority;
        private const string _gameName = "Globle";
        public override string GameName => _gameName;
        private readonly Regex _parser = new Regex($"🌎.*?🌍[\\s\n\r]+Today's guesses: (?<{ScoreGroup}>\\d)");
        protected override Regex Parser => _parser;
        protected override string? ExtraContent => "https://globle-game.com";
    }
}