import { Repo, RepoFile } from "./interfaces";

const files: RepoFile[] = [
  {
    path: "src/main.rs",
    code: `
let mut default_nu_lib_dirs_path = nushell_config_path.clone();
default_nu_lib_dirs_path.push("scripts");
engine_state.add_env_var("NU_LIB_DIRS".to_string(), Value::test_list(vec![]));

let mut working_set = nu_protocol::engine::StateWorkingSet::new(&engine_state);
let var_id = working_set.add_variable(
    b"$NU_LIB_DIRS".into(),
    Span::unknown(),
    Type::List(Box::new(Type::String)),
    false,
);
working_set.set_variable_const_val(
    var_id,
    Value::test_list(vec![
        Value::test_string(default_nu_lib_dirs_path.to_string_lossy()),
        Value::test_string(default_nushell_completions_path.to_string_lossy()),
    ]),
);
engine_state.merge_delta(working_set.render())?;`,
  },
  {
    path: "src/main.rs",
    code: `
let (args_to_nushell, script_name, args_to_script) = gather_commandline_args();
let parsed_nu_cli_args = parse_commandline_args(&args_to_nushell.join(" "), &mut engine_state)
    .unwrap_or_else(|err| {
        report_shell_error(&engine_state, &err);
        std::process::exit(1)
    });

experimental_options::load(&engine_state, &parsed_nu_cli_args, !script_name.is_empty());

// keep this condition in sync with the branches at the end
engine_state.is_interactive = parsed_nu_cli_args.interactive_shell.is_some()
    || (parsed_nu_cli_args.testbin.is_none()
        && parsed_nu_cli_args.commands.is_none()
        && script_name.is_empty());

engine_state.is_login = parsed_nu_cli_args.login_shell.is_some();

engine_state.history_enabled = parsed_nu_cli_args.no_history.is_none();
`,
  },
  {
    path: "src/terminal.rs",
    code: `
fn take_control() -> Pid {
    let shell_pgid = unistd::getpgrp();

    match unistd::tcgetpgrp(unsafe { nu_system::stdin_fd() }) {
        Ok(owner_pgid) if owner_pgid == shell_pgid => {
            return owner_pgid;
        }
        Ok(owner_pgid) if owner_pgid == unistd::getpid() => {
            let _ = unistd::setpgid(owner_pgid, owner_pgid);
            return owner_pgid;
        }
        _ => (),
    }

    // Reset all signal handlers to default
    let default = SigAction::new(SigHandler::SigDfl, SaFlags::empty(), SigSet::empty());
    for sig in Signal::iterator() {
        if let Ok(old_act) = unsafe { sigaction(sig, &default) } {
            if sig == Signal::SIGHUP && old_act.handler() == SigHandler::SigIgn {
                let _ = unsafe { sigaction(sig, &old_act) };
            }
        }
    }
        
    eprintln!("ERROR: failed to take control of the terminal, we might be orphaned");
    std::process::exit(1);
}`,
  },
];

export const nuShellRepo: Repo = {
  label: "nushell",
  url: "https://github.com/nushell/nushell",
  files: files,
};
