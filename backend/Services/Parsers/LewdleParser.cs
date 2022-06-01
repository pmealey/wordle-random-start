using System.Text.RegularExpressions;

namespace backend.Services.Parsers
{
    public class LewdleParser : BasicScoreResultParser
    {
        private ILogger<LewdleParser> _logger;

        public LewdleParser(ILogger<LewdleParser> logger) : base(logger)
        {
            _logger = logger;
        }

        public override DateTime ActiveAfter => DateTime.MinValue;
        public override string Category => "Word";
        public override string GameName => "Lewdle";
        public override string? HelpText => null;
        protected override Regex Parser => new Regex($"{GameName}.*?(?<{ScoreGroup}>[\\dxX])/\\d");
        protected override string? ExtraContent => "lewdlegame.com";
        public override string Url => "https://www.lewdlegame.com";
    }
}
