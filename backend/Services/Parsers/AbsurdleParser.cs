using System.Text.RegularExpressions;

namespace backend.Services.Parsers
{
    public class AbsurdleParser : BasicScoreResultParser
    {
        private ILogger<AbsurdleParser> _logger;

        public AbsurdleParser(ILogger<AbsurdleParser> logger) : base(logger)
        {
            _logger = logger;
        }

        public override string GameName => "Absurdle";
        public override string? HelpText => "Make sure you start with today's word, and don't retread or retry the puzzle.";
        protected override Regex Parser => new Regex($"{GameName} (?<{ScoreGroup}>\\d+)/");
        protected override string? ExtraContent => Url;
        public override string Url => "https://qntm.org/files/absurdle/absurdle.html";
    }
}
