using System.Text.RegularExpressions;

namespace backend.Services.Parsers
{
    public class CloudleParser : BasicScoreResultParser
    {
        private ILogger<CloudleParser> _logger;

        public CloudleParser(ILogger<CloudleParser> logger) : base(logger)
        {
            _logger = logger;
        }

        private const string _gameName = "Cloudle";
        public override string GameName => _gameName;
        private readonly Regex _parser = new Regex($"{_gameName} .*? (?<{ScoreGroup}>[\\d|X])/\\d");
        protected override Regex Parser => _parser;
        protected override string? ExtraContent => _url;
        private const string _url = "https://cogit.fun/cloudle";
        public override string Url => _url;
    }
}
