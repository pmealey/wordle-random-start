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

        private const string _gameName = "Absurdle";
        public override string GameName => _gameName;
        private readonly Regex _parser = new Regex($"{_gameName} (?<{ScoreGroup}>\\d+)/");
        protected override Regex Parser => _parser;
        protected override string? ExtraContent => _url;
        private const string _url = "https://qntm.org/files/absurdle/absurdle.html";
        public override string Url => _url;
    }
}
