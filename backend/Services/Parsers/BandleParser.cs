using System.Text.RegularExpressions;

namespace backend.Services.Parsers
{
    public class BandleParser : BasicScoreResultParser
    {
        private ILogger<BandleParser> _logger;

        public BandleParser(ILogger<BandleParser> logger) : base(logger)
        {
            _logger = logger;
        }

        public override bool CountWinner => true;
        public override bool Default => false;
        public override string GameName => "Bandle";
        public override string? HelpText => null;
        protected override Regex Parser => new Regex($"{GameName} .+?(?<{ScoreGroup}>[\\d|x])/\\d");
        protected override string? ExtraContent => Url;
        public override string Url => "https://bandle.app/";
    }
}
