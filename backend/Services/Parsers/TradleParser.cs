using System.Text.RegularExpressions;

namespace backend.Services.Parsers
{
    public class TradleParser : BasicScoreResultParser
    {
        private ILogger<TradleParser> _logger;

        public TradleParser(ILogger<TradleParser> logger) : base(logger)
        {
            _logger = logger;
        }

        public override bool CountWinner => true;
        public override bool Default => false;
        public override string GameName => "Tradle";
        public override string? HelpText => null;
        protected override Regex Parser => new Regex($"#{GameName} #\\d+ (?<{ScoreGroup}>[\\d|X])/\\d");
        protected override string? ExtraContent => Url;
        public override string Url => "https://oec.world/en/tradle";
    }
}
