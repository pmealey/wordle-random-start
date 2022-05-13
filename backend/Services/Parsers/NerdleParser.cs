using System.Text.RegularExpressions;

namespace backend.Services.Parsers
{
    public class NerdleParser : BasicScoreResultParser
    {
        private ILogger<NerdleParser> _logger;

        public NerdleParser(ILogger<NerdleParser> logger) : base(logger)
        {
            _logger = logger;
        }

        private const string _gameName = "Nerdle";
        public override string GameName => _gameName;
        private readonly Regex _parser = new Regex($"{_gameName.ToLower()}game \\d+ (?<{ScoreGroup}>[\\d|X])/\\d");
        protected override Regex Parser => _parser;
        protected override string? ExtraContent => $"{_url} #nerdle";
        private const string _url = "https://nerdlegame.com";
        public override string Url => _url;
    }
}
