using System.Text.RegularExpressions;

namespace backend.Services.Parsers
{
    public class ColorfleParser : BasicScoreResultParser
    {
        private ILogger<ColorfleParser> _logger;

        public ColorfleParser(ILogger<ColorfleParser> logger) : base(logger)
        {
            _logger = logger;
        }

        public override bool CountWinner => true;
        public override string GameName => "Colorfle";
        public override string? HelpText => "Select 'NORMAL' from the difficulty selector.";
        protected override Regex Parser => new Regex($"{GameName} \\d+ (?<{ScoreGroup}>[\\d|X])/\\d");
        protected override string? ExtraContent => null;
        public override string Url => "https://colorfle.com/";
    }
}
