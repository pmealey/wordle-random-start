using System.Text.RegularExpressions;

namespace backend.Services.Parsers
{
    public class BazingleParser : BasicScoreResultParser
    {
        private ILogger<BazingleParser> _logger;

        public BazingleParser(ILogger<BazingleParser> logger) : base(logger)
        {
            _logger = logger;
        }

        public override bool CountWinner => false;
        public override string GameName => "Bazingle";
        public override string? HelpText => null;
        protected override Regex Parser => new Regex($"{GameName} .+?(?<{ScoreGroup}>[\\d|X|x])/\\d");
        protected override string? ExtraContent => Url;
        public override string Url => "https://bazingle.wook.wtf";
    }
}
