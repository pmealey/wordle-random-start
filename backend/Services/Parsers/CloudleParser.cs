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

        public override bool CountWinner => true;
        public override string GameName => "Cloudle";
        public override string? HelpText => null;
        protected override Regex Parser => new Regex($"{GameName} .*? (?<{ScoreGroup}>[\\d|X])/\\d");
        protected override string? ExtraContent => Url;
        public override string Url => "https://cloudle.app/";
    }
}
