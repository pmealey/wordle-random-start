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

        private const int _priority = 7;
        public override int Priority => _priority;
        private const string _gameName = "Lewdle";
        public override string GameName => _gameName;
        private readonly Regex _parser = new Regex($"{_gameName}.*?(?<{ScoreGroup}>[\\dxX])/\\d");
        protected override Regex Parser => _parser;
        protected override string? ExtraContent => "lewdlegame.com";
        private const string _url = "https://www.lewdlegame.com";
        public override string Url => _url;
    }
}
