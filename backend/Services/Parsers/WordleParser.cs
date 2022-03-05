using System.Text.RegularExpressions;

namespace backend.Services.Parsers
{
    public class WordleParser : BasicScoreResultParser
    {
        private ILogger<WordleParser> _logger;

        public WordleParser(ILogger<WordleParser> logger) : base(logger)
        {
            _logger = logger;
        }

        private const int _priority = 0;
        public override int Priority => _priority;
        private const string _gameName = "Wordle";
        public override string GameName => _gameName;
        private readonly Regex _parser = new Regex($"{_gameName} \\d+ (?<{ScoreGroup}>[\\d|X])/\\d");
        protected override Regex Parser => _parser;
        protected override string? ExtraContent => null;
    }
}
