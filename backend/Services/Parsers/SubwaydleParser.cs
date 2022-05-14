using System.Text.RegularExpressions;

namespace backend.Services.Parsers
{
    public class SubwaydleParser : BasicScoreResultParser
    {
        private ILogger<SubwaydleParser> _logger;

        public SubwaydleParser(ILogger<SubwaydleParser> logger) : base(logger)
        {
            _logger = logger;
        }

        private const string _gameName = "Subwaydle";
        public override string GameName => _gameName;
        private readonly Regex _parser = new Regex($"{_gameName} \\d+ (?<{ScoreGroup}>[\\d|X])/\\d");
        protected override Regex Parser => _parser;
        protected override string? ExtraContent => null;
        private const string _url = "https://www.subwaydle.com/";
        public override string Url => _url;
    }
}
