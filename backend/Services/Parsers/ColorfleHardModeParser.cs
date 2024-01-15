using System.Text.RegularExpressions;

namespace backend.Services.Parsers
{
    public class ColorfleHardModeParser : ColorfleParser
    {
        private ILogger<ColorfleHardModeParser> _logger;

        public ColorfleHardModeParser(ILogger<ColorfleHardModeParser> logger) : base(logger)
        {
            _logger = logger;
        }

        public override string GameName => "Colorfle (Hard mode)";
        public override string? HelpText => "Select 'HARD' from the difficulty selector.";
        protected override Regex Parser => new Regex($@"Colorfle \d+ \(Hard mode\) (?<{ScoreGroup}>[\d|X])/\d");
    }
}
