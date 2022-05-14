using System.Text.RegularExpressions;

namespace backend.Services.Parsers
{
    public class PoeltlParser : BasicScoreResultParser
    {
        private ILogger<PoeltlParser> _logger;

        public PoeltlParser(ILogger<PoeltlParser> logger) : base(logger)
        {
            _logger = logger;
        }

        private const string _gameName = "Poeltl";
        public override string GameName => _gameName;
        private readonly Regex _parser = new Regex($"{_gameName} \\d+ - (?<{ScoreGroup}>[\\d|X])/\\d");
        protected override Regex Parser => _parser;
        protected override string? ExtraContent => null;
        private const string _url = "https://poeltl.dunk.town/";
        public override string Url => _url;
    }
}
