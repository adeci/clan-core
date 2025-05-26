const sample = `evaluating file '<nix/derivation-internal.nix>'
evaluating derivation 'flake:nixpkgs#hello'...
copying "/nix/store/23v68yyg761nf7bsl4yfgvfqidwfaqmm-source" to the store...
evaluating file '/nix/store/23v68yyg761nf7bsl4yfgvfqidwfaqmm-source/flake.nix'
evaluating file '/nix/store/23v68yyg761nf7bsl4yfgvfqidwfaqmm-source/flake.nix'
checking outputs of '/nix/store/vmn4z8cvaxdxa5i56lbl82gqzddh4jik-hello-2.12.1.drv'...
hello> Using versionCheckHook
hello> Running phase: unpackPhase
hello> unpacking source archive /nix/store/pa10z4ngm0g83kx9mssrqzz30s84vq7k-hello-2.12.1.tar.gz
hello> source root is hello-2.12.1
hello> setting SOURCE_DATE_EPOCH to timestamp 1653865426 of file "hello-2.12.1/ChangeLog"
hello> Running phase: patchPhase
hello> Running phase: updateAutotoolsGnuConfigScriptsPhase
hello> Updating Autotools / GNU config script to a newer upstream version: ./build-aux/config.sub
hello> Updating Autotools / GNU config script to a newer upstream version: ./build-aux/config.guess
hello> Running phase: configurePhase
hello> patching script interpreter paths in ./configure
hello> ./configure: interpreter directive changed from "#! /bin/sh" to "/nix/store/xy4jjgw87sbgwylm5kn047d9gkbhsr9x-bash-5.2p37/bin/sh"
hello> configure flags: --disable-dependency-tracking --prefix=/nix/store/lz9gfg6iybsh0hiignpk55w99a3bj4vb-hello-2.12.1
hello> checking for a BSD-compatible install... /nix/store/87fck6hm17chxjq7badb11mq036zbyv9-coreutils-9.7/bin/install -c
hello> checking whether build environment is sane... yes
hello> checking for a thread-safe mkdir -p... /nix/store/87fck6hm17chxjq7badb11mq036zbyv9-coreutils-9.7/bin/mkdir -p
hello> checking for gawk... gawk
hello> checking whether make sets $(MAKE)... yes
hello> checking whether make supports nested variables... yes
hello> checking for gcc... gcc
hello> checking whether the C compiler works... yes
hello> checking for C compiler default output file name... a.out
hello> checking for suffix of executables...
hello> checking whether we are cross compiling... no
hello> checking for suffix of object files... o
hello> checking whether we are using the GNU C compiler... yes
hello> checking whether gcc accepts -g... yes
hello> checking for gcc option to enable C11 features... none needed
hello> checking whether the compiler is clang... no
hello> checking for compiler option needed when checking for declarations... none
hello> checking whether make supports the include directive... yes (GNU style)
hello> checking dependency style of gcc... none
hello> checking how to run the C preprocessor... gcc -E
hello> checking for grep that handles long lines and -e... /nix/store/gqmr3gixlddz3667ba1iyqck3c0dkpvd-gnugrep-3.11/bin/grep
hello> checking for egrep... /nix/store/gqmr3gixlddz3667ba1iyqck3c0dkpvd-gnugrep-3.11/bin/grep -E
hello> checking for ANSI C header files... yes
hello> checking for sys/types.h... yes
hello> checking for sys/stat.h... yes
hello> checking for stdlib.h... yes
hello> checking for string.h... yes
hello> checking for memory.h... yes
hello> checking for strings.h... yes
hello> checking for inttypes.h... yes
hello> checking for stdint.h... yes
hello> checking for unistd.h... yes
hello> checking for wchar.h... yes
hello> checking for minix/config.h... no
hello> checking for sys/socket.h... yes
hello> checking for unistd.h... (cached) yes
hello> checking for stdio_ext.h... yes
hello> checking for sys/stat.h... (cached) yes
hello> checking for getopt.h... yes
hello> checking for sys/cdefs.h... yes
hello> checking for threads.h... yes
hello> checking for iconv.h... yes
hello> checking for limits.h... yes
hello> checking for inttypes.h... (cached) yes
hello> checking for sys/types.h... (cached) yes
hello> checking for stdint.h... (cached) yes
hello> checking for crtdefs.h... no
hello> checking for wctype.h... yes
hello> checking for xlocale.h... no
hello> checking for sys/mman.h... yes
hello> checking for sys/param.h... yes
hello> checking for sys/time.h... yes
hello> checking for features.h... yes
hello> checking whether it is safe to define __EXTENSIONS__... yes
hello> checking whether _XOPEN_SOURCE should be defined... no
hello> checking for Minix Amsterdam compiler... no
hello> checking for ar... ar
hello> checking for special C compiler options needed for large files... no
hello> checking for _FILE_OFFSET_BITS value needed for large files... no
hello> checking for size_t... yes
hello> checking for working alloca.h... yes
hello> checking for alloca... yes
hello> checking for _set_invalid_parameter_handler... no
hello> checking for fcntl... yes
hello> checking for symlink... yes
hello> checking for getdtablesize... yes
hello> checking for getprogname... no
hello> checking for getexecname... no
hello> checking for iswcntrl... yes
hello> checking for iswblank... yes
hello> checking for mbsinit... yes
hello> checking for mbrtowc... yes
hello> checking for mbslen... no
hello> checking for mbsrtowcs... yes
hello> checking for mprotect... yes
hello> checking for lstat... yes
hello> checking for strndup... yes
hello> checking for wcwidth... yes
hello> checking build system type... x86_64-pc-linux-gnu
hello> checking host system type... x86_64-pc-linux-gnu
hello> checking whether the preprocessor supports include_next... yes
hello> checking whether source code line length is unlimited... yes
hello> checking for complete errno.h... yes
hello> checking whether strerror_r is declared... yes
hello> checking for strerror_r... yes
hello> checking whether strerror_r returns char *... yes
hello> checking for working fcntl.h... yes
hello> checking for pid_t... yes
hello> checking for mode_t... yes
hello> checking whether stat file-mode macros are broken... no
hello> checking for C/C++ restrict keyword... __restrict__
hello> checking for nlink_t... yes
hello> checking whether getdtablesize is declared... yes
hello> checking for getopt.h... (cached) yes
hello> checking for getopt_long_only... yes
hello> checking whether getopt is POSIX compatible... yes
hello> checking for working GNU getopt function... yes
hello> checking for working GNU getopt_long function... yes
hello> checking pthread.h usability... yes
hello> checking pthread.h presence... yes
hello> checking for pthread.h... yes
hello> checking for pthread_kill in -lpthread... yes
hello> checking whether POSIX threads API is available... yes
hello> checking whether setlocale (LC_ALL, NULL) is multithread-safe... yes
hello> checking whether setlocale (category, NULL) is multithread-safe... yes
hello> checking for ld... ld
hello> checking if the linker (ld) is GNU ld... yes
hello> checking for shared library run path origin... done
hello> checking 32-bit host C ABI... no
hello> checking for ELF binary format... yes
hello> checking for the common suffixes of directories in the library search path... lib,lib,lib
hello> checking for iconv... yes
hello> checking for working iconv... yes
hello> checking whether iconv is compatible with its POSIX signature... yes
hello> checking for inline... inline
hello> checking whether limits.h has LLONG_MAX, WORD_BIT, ULLONG_WIDTH etc.... yes
hello> checking for wint_t... yes
hello> checking whether wint_t is large enough... yes
hello> checking whether the compiler produces multi-arch binaries... no
hello> checking whether stdint.h conforms to C99... yes
hello> checking whether stdint.h works without ISO C predefines... yes
hello> checking whether stdint.h has UINTMAX_WIDTH etc.... yes
hello> checking whether iswcntrl works... yes
hello> checking for towlower... yes
hello> checking for wctype_t... yes
hello> checking for wctrans_t... yes
hello> checking for nl_langinfo and CODESET... yes
hello> checking for a traditional french locale... none
hello> checking for a traditional japanese locale... none
hello> checking for a french Unicode locale... none
hello> checking for a transitional chinese locale... none
hello> checking for wchar_t... yes
hello> checking for good max_align_t... yes
hello> checking whether NULL can be used in arbitrary expressions... yes
hello> checking whether locale.h defines locale_t... yes
hello> checking for a sed that does not truncate output... /nix/store/clbb2cvigynr235ab5zgi18dyavznlk2-gnused-4.9/bin/sed
hello> checking whether malloc, realloc, calloc are POSIX compliant... yes
hello> checking for GNU libc compatible malloc... yes
hello> checking for mbstate_t... yes
hello> checking for mmap... yes
hello> checking for MAP_ANONYMOUS... yes
hello> checking whether memchr works... yes
hello> checking whether <limits.h> defines MIN and MAX... no
hello> checking whether <sys/param.h> defines MIN and MAX... yes
hello> checking for O_CLOEXEC... yes
hello> checking for promoted mode_t type... mode_t
hello> checking for stdbool.h that conforms to C99... yes
hello> checking for _Bool... yes
hello> checking whether fcloseall is declared... yes
hello> checking whether ecvt is declared... yes
hello> checking whether fcvt is declared... yes
hello> checking whether gcvt is declared... yes
hello> checking whether strerror(0) succeeds... yes
hello> checking whether strndup is declared... yes
hello> checking whether strnlen is declared... yes
hello> checking for struct timespec in <time.h>... yes
hello> checking whether execvpe is declared... yes
hello> checking whether <wchar.h> uses 'inline' correctly... yes
hello> checking for alloca as a compiler built-in... yes
hello> checking whether // is distinct from /... no
hello> checking whether dup2 works... yes
hello> checking for error_at_line... yes
hello> checking whether fcntl handles F_DUPFD correctly... yes
hello> checking whether fcntl understands F_DUPFD_CLOEXEC... needs runtime check
hello> checking for __fpending... yes
hello> checking whether __fpending is declared... yes
hello> checking whether getdtablesize works... yes
hello> checking whether program_invocation_name is declared... yes
hello> checking whether program_invocation_short_name is declared... yes
hello> checking whether __argv is declared... no
hello> checking whether the compiler generally respects inline... yes
hello> checking whether iswblank is declared... yes
hello> checking whether iswdigit is ISO C compliant... guessing yes
hello> checking whether iswxdigit is ISO C compliant... guessing yes
hello> checking whether locale.h conforms to POSIX:2001... yes
hello> checking whether struct lconv is properly defined... yes
hello> checking whether mbrtowc handles incomplete characters... guessing yes
hello> checking whether mbrtowc works as well as mbtowc... guessing yes
hello> checking whether mbrtowc handles a NULL pwc argument... guessing yes
hello> checking whether mbrtowc handles a NULL string argument... guessing yes
hello> checking whether mbrtowc has a correct return value... guessing yes
hello> checking whether mbrtowc returns 0 when parsing a NUL character... guessing yes
hello> checking whether mbrtowc stores incomplete characters... guessing no
hello> checking whether mbrtowc works on empty input... yes
hello> checking whether the C locale is free of encoding errors... no
hello> checking whether mbrtowc handles incomplete characters... (cached) guessing yes
hello> checking whether mbrtowc works as well as mbtowc... (cached) guessing yes
hello> checking whether mbrtowc handles incomplete characters... (cached) guessing yes
hello> checking whether mbrtowc works as well as mbtowc... (cached) guessing yes
hello> checking whether mbsrtowcs works... guessing yes
hello> checking whether open recognizes a trailing slash... yes
hello> checking whether program_invocation_name is declared... (cached) yes
hello> checking whether program_invocation_short_name is declared... (cached) yes
hello> checking whether setlocale (LC_ALL, NULL) is multithread-safe... (cached) yes
hello> checking whether setlocale (category, NULL) is multithread-safe... (cached) yes
hello> checking for ssize_t... yes
hello> checking whether stat handles trailing slashes on files... yes
hello> checking for struct stat.st_atim.tv_nsec... yes
hello> checking whether struct stat.st_atim is of type struct timespec... yes
hello> checking for struct stat.st_birthtimespec.tv_nsec... no
hello> checking for struct stat.st_birthtimensec... no
hello> checking for struct stat.st_birthtim.tv_nsec... no
hello> checking for va_copy... yes
hello> checking for good max_align_t... (cached) yes
hello> checking whether NULL can be used in arbitrary expressions... (cached) yes
hello> checking which flavor of printf attribute matches inttypes macros... system
hello> checking for working stdnoreturn.h... yes
hello> checking for working strerror function... yes
hello> checking for working strndup... yes
hello> checking for working strnlen... yes
hello> checking for nlink_t... (cached) yes
hello> checking whether wcsdup is declared... yes
hello> checking whether iswcntrl works... (cached) yes
hello> checking for towlower... (cached) yes
hello> checking for wctype_t... (cached) yes
hello> checking for wctrans_t... (cached) yes
hello> checking whether wcwidth is declared... yes
hello> checking whether wcwidth works reasonably in UTF-8 locales... yes
hello> checking whether NLS is requested... yes
hello> checking for msgfmt... no
hello> checking for gmsgfmt... :
hello> checking for xgettext... no
hello> checking for msgmerge... no
hello> checking for CFPreferencesCopyAppValue... no
hello> checking for CFLocaleCopyPreferredLanguages... no
hello> checking for GNU gettext in libc... yes
hello> checking whether to use NLS... yes
hello> checking where the gettext function comes from... libc
hello> checking that generated files are newer than configure... done
hello> configure: creating ./config.status
hello> config.status: creating Makefile
hello> config.status: creating po/Makefile.in
hello> config.status: creating config.h
hello> config.status: executing depfiles commands
hello> config.status: executing po-directories commands
hello> config.status: creating po/POTFILES
hello> config.status: creating po/Makefile
hello> Running phase: buildPhase
hello> build flags: SHELL=/nix/store/xy4jjgw87sbgwylm5kn047d9gkbhsr9x-bash-5.2p37/bin/bash
hello> rm -f lib/alloca.h-t lib/alloca.h && \\
hello> { echo '/* DO NOT EDIT! GENERATED AUTOMATICALLY! */'; \\
hello>   sed -e 's|@''HAVE_ALLOCA_H''@|1|g' < ./lib/alloca.in.h; \\
hello> } > lib/alloca.h-t && \\
hello> mv -f lib/alloca.h-t lib/alloca.h
hello> rm -f lib/configmake.h-t && \\
hello> { echo '/* DO NOT EDIT! GENERATED AUTOMATICALLY! */'; \\
hello>   echo '#if HAVE_WINSOCK2_H'; \\
hello>   echo '# include <winsock2.h> /* avoid mingw pollution on DATADIR */'; \\
hello>   echo '#endif'; \\
hello>   echo '#define PREFIX "/nix/store/lz9gfg6iybsh0hiignpk55w99a3bj4vb-hello-2.12.1"'; \\
hello>   echo '#define EXEC_PREFIX "/nix/store/lz9gfg6iybsh0hiignpk55w99a3bj4vb-hello-2.12.1"'; \\
hello>   echo '#define BINDIR "/nix/store/lz9gfg6iybsh0hiignpk55w99a3bj4vb-hello-2.12.1/bin"'; \\
hello>   echo '#define SBINDIR "/nix/store/lz9gfg6iybsh0hiignpk55w99a3bj4vb-hello-2.12.1/sbin"'; \\
hello>   echo '#define LIBEXECDIR "/nix/store/lz9gfg6iybsh0hiignpk55w99a3bj4vb-hello-2.12.1/libexec"'; \\
hello>   echo '#define DATAROOTDIR "/nix/store/lz9gfg6iybsh0hiignpk55w99a3bj4vb-hello-2.12.1/share"'; \\
hello>   echo '#define DATADIR "/nix/store/lz9gfg6iybsh0hiignpk55w99a3bj4vb-hello-2.12.1/share"'; \\
hello>   echo '#define SYSCONFDIR "/nix/store/lz9gfg6iybsh0hiignpk55w99a3bj4vb-hello-2.12.1/etc"'; \\
hello>   echo '#define SHAREDSTATEDIR "/nix/store/lz9gfg6iybsh0hiignpk55w99a3bj4vb-hello-2.12.1/com"'; \\
hello>   echo '#define LOCALSTATEDIR "/nix/store/lz9gfg6iybsh0hiignpk55w99a3bj4vb-hello-2.12.1/var"'; \\
hello>   echo '#define RUNSTATEDIR "/nix/store/lz9gfg6iybsh0hiignpk55w99a3bj4vb-hello-2.12.1/var/run"'; \\
hello>   echo '#define INCLUDEDIR "/nix/store/lz9gfg6iybsh0hiignpk55w99a3bj4vb-hello-2.12.1/include"'; \\
hello>   echo '#define OLDINCLUDEDIR "/usr/include"'; \\
hello>   echo '#define DOCDIR "/nix/store/lz9gfg6iybsh0hiignpk55w99a3bj4vb-hello-2.12.1/share/doc/hello"'; \\
hello>   echo '#define INFODIR "/nix/store/lz9gfg6iybsh0hiignpk55w99a3bj4vb-hello-2.12.1/share/info"'; \\
hello>   echo '#define HTMLDIR "/nix/store/lz9gfg6iybsh0hiignpk55w99a3bj4vb-hello-2.12.1/share/doc/hello"'; \\
hello>   echo '#define DVIDIR "/nix/store/lz9gfg6iybsh0hiignpk55w99a3bj4vb-hello-2.12.1/share/doc/hello"'; \\
hello>   echo '#define PDFDIR "/nix/store/lz9gfg6iybsh0hiignpk55w99a3bj4vb-hello-2.12.1/share/doc/hello"'; \\
hello>   echo '#define PSDIR "/nix/store/lz9gfg6iybsh0hiignpk55w99a3bj4vb-hello-2.12.1/share/doc/hello"'; \\
hello>   echo '#define LIBDIR "/nix/store/lz9gfg6iybsh0hiignpk55w99a3bj4vb-hello-2.12.1/lib"'; \\
hello>   echo '#define LISPDIR "/nix/store/lz9gfg6iybsh0hiignpk55w99a3bj4vb-hello-2.12.1/share/emacs/site-lisp"'; \\
hello>   echo '#define LOCALEDIR "/nix/store/lz9gfg6iybsh0hiignpk55w99a3bj4vb-hello-2.12.1/share/locale"'; \\
hello>   echo '#define MANDIR "/nix/store/lz9gfg6iybsh0hiignpk55w99a3bj4vb-hello-2.12.1/share/man"'; \\
hello>   echo '#define MANEXT ""'; \\
hello>   echo '#define PKGDATADIR "/nix/store/lz9gfg6iybsh0hiignpk55w99a3bj4vb-hello-2.12.1/share/hello"'; \\
hello>   echo '#define PKGINCLUDEDIR "/nix/store/lz9gfg6iybsh0hiignpk55w99a3bj4vb-hello-2.12.1/include/hello"'; \\
hello>   echo '#define PKGLIBDIR "/nix/store/lz9gfg6iybsh0hiignpk55w99a3bj4vb-hello-2.12.1/lib/hello"'; \\
hello>   echo '#define PKGLIBEXECDIR "/nix/store/lz9gfg6iybsh0hiignpk55w99a3bj4vb-hello-2.12.1/libexec/hello"'; \\
hello> } | sed '/""/d' > lib/configmake.h-t && \\
hello> mv -f lib/configmake.h-t lib/configmake.h
hello> rm -f lib/fcntl.h-t lib/fcntl.h && \\
hello> { echo '/* DO NOT EDIT! GENERATED AUTOMATICALLY! */'; \\
hello>   sed -e 's|@''GUARD_PREFIX''@|GL|g' \\
hello>       -e 's|@''INCLUDE_NEXT''@|include_next|g' \\
hello>       -e 's|@''PRAGMA_SYSTEM_HEADER''@|#pragma GCC system_header|g' \\
hello>       -e 's|@''PRAGMA_COLUMNS''@||g' \\
hello>       -e 's|@''NEXT_FCNTL_H''@|<fcntl.h>|g' \\
hello>       -e 's/@''GNULIB_CREAT''@/0/g' \\
hello>       -e 's/@''GNULIB_FCNTL''@/1/g' \\
hello>       -e 's/@''GNULIB_NONBLOCKING''@/0/g' \\
hello>       -e 's/@''GNULIB_OPEN''@/1/g' \\
hello>       -e 's/@''GNULIB_OPENAT''@/0/g' \\
hello>       -e 's/@''GNULIB_MDA_CREAT''@/1/g' \\
hello>       -e 's/@''GNULIB_MDA_OPEN''@/1/g' \\
hello>       -e 's|@''HAVE_FCNTL''@|1|g' \\
hello>       -e 's|@''HAVE_OPENAT''@|1|g' \\
hello>       -e 's|@''REPLACE_CREAT''@|0|g' \\
hello>       -e 's|@''REPLACE_FCNTL''@|1|g' \\
hello>       -e 's|@''REPLACE_OPEN''@|0|g' \\
hello>       -e 's|@''REPLACE_OPENAT''@|0|g' \\
hello>       -e '/definitions of _GL_FUNCDECL_RPL/r ./lib/c++defs.h' \\
hello>       -e '/definition of _GL_ARG_NONNULL/r ./lib/arg-nonnull.h' \\
hello>       -e '/definition of _GL_WARN_ON_USE/r ./lib/warn-on-use.h' \\
hello>       < ./lib/fcntl.in.h; \\
hello> } > lib/fcntl.h-t && \\
hello> mv lib/fcntl.h-t lib/fcntl.h
hello> rm -f lib/iconv.h-t lib/iconv.h && \\
hello> { echo '/* DO NOT EDIT! GENERATED AUTOMATICALLY! */' && \\
hello>   sed -e 's|@''GUARD_PREFIX''@|GL|g' \\
hello>       -e 's|@''INCLUDE_NEXT''@|include_next|g' \\
hello>       -e 's|@''PRAGMA_SYSTEM_HEADER''@|#pragma GCC system_header|g' \\
hello>       -e 's|@''PRAGMA_COLUMNS''@||g' \\
hello>       -e 's|@''NEXT_ICONV_H''@|<iconv.h>|g' \\
hello>       -e 's/@''GNULIB_ICONV''@/1/g' \\
hello>       -e 's|@''ICONV_CONST''@||g' \\
hello>       -e 's|@''REPLACE_ICONV''@|0|g' \\
hello>       -e 's|@''REPLACE_ICONV_OPEN''@|0|g' \\
hello>       -e 's|@''REPLACE_ICONV_UTF''@|0|g' \\
hello>       -e '/definitions of _GL_FUNCDECL_RPL/r ./lib/c++defs.h' \\
hello>       -e '/definition of _GL_ARG_NONNULL/r ./lib/arg-nonnull.h' \\
hello>       -e '/definition of _GL_WARN_ON_USE/r ./lib/warn-on-use.h' \\
hello>       < ./lib/iconv.in.h; \\
hello> } > lib/iconv.h-t && \\
hello> mv lib/iconv.h-t lib/iconv.h
hello> rm -f lib/inttypes.h-t lib/inttypes.h && \\
hello> { echo '/* DO NOT EDIT! GENERATED AUTOMATICALLY! */'; \\
hello>   sed -e 's/@''HAVE_INTTYPES_H''@/1/g' \\
hello>       -e 's|@''INCLUDE_NEXT''@|include_next|g' \\
hello>       -e 's|@''PRAGMA_SYSTEM_HEADER''@|#pragma GCC system_header|g' \\
hello>       -e 's|@''PRAGMA_COLUMNS''@||g' \\
hello>       -e 's|@''NEXT_INTTYPES_H''@|<inttypes.h>|g' \\
hello>       -e 's/@''APPLE_UNIVERSAL_BUILD''@/0/g' \\
hello>       -e 's/@''PRIPTR_PREFIX''@/__PRIPTR_PREFIX/g' \\
hello>       -e 's/@''GNULIB_IMAXABS''@/0/g' \\
hello>       -e 's/@''GNULIB_IMAXDIV''@/0/g' \\
hello>       -e 's/@''GNULIB_STRTOIMAX''@/0/g' \\
hello>       -e 's/@''GNULIB_STRTOUMAX''@/0/g' \\
hello>       -e 's/@''HAVE_DECL_IMAXABS''@/1/g' \\
hello>       -e 's/@''HAVE_DECL_IMAXDIV''@/1/g' \\
hello>       -e 's/@''HAVE_DECL_STRTOIMAX''@/1/g' \\
hello>       -e 's/@''HAVE_DECL_STRTOUMAX''@/1/g' \\
hello>       -e 's/@''HAVE_IMAXDIV_T''@/1/g' \\
hello>       -e 's/@''REPLACE_STRTOIMAX''@/0/g' \\
hello>       -e 's/@''REPLACE_STRTOUMAX''@/0/g' \\
hello>       -e 's/@''INT32_MAX_LT_INTMAX_MAX''@/1/g' \\
hello>       -e 's/@''INT64_MAX_EQ_LONG_MAX''@/defined _LP64/g' \\
hello>       -e 's/@''UINT32_MAX_LT_UINTMAX_MAX''@/1/g' \\
hello>       -e 's/@''UINT64_MAX_EQ_ULONG_MAX''@/defined _LP64/g' \\
hello>       -e '/definitions of _GL_FUNCDECL_RPL/r ./lib/c++defs.h' \\
hello>       -e '/definition of _GL_ARG_NONNULL/r ./lib/arg-nonnull.h' \\
hello>       -e '/definition of _GL_WARN_ON_USE/r ./lib/warn-on-use.h' \\
hello>       < ./lib/inttypes.in.h; \\
hello> } > lib/inttypes.h-t && \\
hello> mv lib/inttypes.h-t lib/inttypes.h
hello> rm -f lib/limits.h-t lib/limits.h && \\
hello> { echo '/* DO NOT EDIT! GENERATED AUTOMATICALLY! */' && \\
hello>   sed -e 's|@''GUARD_PREFIX''@|GL|g' \\
hello>       -e 's|@''INCLUDE_NEXT''@|include_next|g' \\
hello>       -e 's|@''PRAGMA_SYSTEM_HEADER''@|#pragma GCC system_header|g' \\
hello>       -e 's|@''PRAGMA_COLUMNS''@||g' \\
hello>       -e 's|@''NEXT_LIMITS_H''@|<limits.h>|g' \\
hello>       < ./lib/limits.in.h; \\
hello> } > lib/limits.h-t && \\
hello> mv lib/limits.h-t lib/limits.h
hello> rm -f lib/locale.h-t lib/locale.h && \\
hello> { echo '/* DO NOT EDIT! GENERATED AUTOMATICALLY! */' && \\
hello>   sed -e 's|@''GUARD_PREFIX''@|GL|g' \\
hello>       -e 's|@''INCLUDE_NEXT''@|include_next|g' \\
hello>       -e 's|@''PRAGMA_SYSTEM_HEADER''@|#pragma GCC system_header|g' \\
hello>       -e 's|@''PRAGMA_COLUMNS''@||g' \\
hello>       -e 's|@''NEXT_LOCALE_H''@|<locale.h>|g' \\
hello>       -e 's/@''GNULIB_LOCALECONV''@/0/g' \\
hello>       -e 's/@''GNULIB_SETLOCALE''@/0/g' \\
hello>       -e 's/@''GNULIB_SETLOCALE_NULL''@/1/g' \\
hello>       -e 's/@''GNULIB_DUPLOCALE''@/0/g' \\
hello>       -e 's/@''GNULIB_LOCALENAME''@/0/g' \\
hello>       -e 's|@''HAVE_NEWLOCALE''@|1|g' \\
hello>       -e 's|@''HAVE_DUPLOCALE''@|1|g' \\
hello>       -e 's|@''HAVE_FREELOCALE''@|1|g' \\
hello>       -e 's|@''HAVE_XLOCALE_H''@|0|g' \\
hello>       -e 's|@''REPLACE_LOCALECONV''@|0|g' \\
hello>       -e 's|@''REPLACE_SETLOCALE''@|0|g' \\
hello>       -e 's|@''REPLACE_NEWLOCALE''@|0|g' \\
hello>       -e 's|@''REPLACE_DUPLOCALE''@|0|g' \\
hello>       -e 's|@''REPLACE_FREELOCALE''@|0|g' \\
hello>       -e 's|@''REPLACE_STRUCT_LCONV''@|0|g' \\
hello>       -e '/definitions of _GL_FUNCDECL_RPL/r ./lib/c++defs.h' \\
hello>       -e '/definition of _GL_ARG_NONNULL/r ./lib/arg-nonnull.h' \\
hello>       -e '/definition of _GL_WARN_ON_USE/r ./lib/warn-on-use.h' \\
hello>       < ./lib/locale.in.h; \\
hello> } > lib/locale.h-t && \\
hello> mv lib/locale.h-t lib/locale.h
hello> rm -f lib/stdio.h-t lib/stdio.h && \\
hello> { echo '/* DO NOT EDIT! GENERATED AUTOMATICALLY! */' && \\
hello>   sed -e 's|@''GUARD_PREFIX''@|GL|g' \\
hello>       -e 's|@''INCLUDE_NEXT''@|include_next|g' \\
hello>       -e 's|@''PRAGMA_SYSTEM_HEADER''@|#pragma GCC system_header|g' \\
hello>       -e 's|@''PRAGMA_COLUMNS''@||g' \\
hello>       -e 's|@''NEXT_STDIO_H''@|<stdio.h>|g' \\
hello>       -e 's/@''GNULIB_DPRINTF''@/0/g' \\
hello>       -e 's/@''GNULIB_FCLOSE''@/0/g' \\
hello>       -e 's/@''GNULIB_FDOPEN''@/0/g' \\
hello>       -e 's/@''GNULIB_FFLUSH''@/0/g' \\
hello>       -e 's/@''GNULIB_FGETC''@/1/g' \\
hello>       -e 's/@''GNULIB_FGETS''@/1/g' \\
hello>       -e 's/@''GNULIB_FOPEN''@/0/g' \\
hello>       -e 's/@''GNULIB_FPRINTF''@/1/g' \\
hello>       -e 's/@''GNULIB_FPRINTF_POSIX''@/0/g' \\
hello>       -e 's/@''GNULIB_FPURGE''@/0/g' \\
hello>       -e 's/@''GNULIB_FPUTC''@/1/g' \\
hello>       -e 's/@''GNULIB_FPUTS''@/1/g' \\
hello>       -e 's/@''GNULIB_FREAD''@/1/g' \\
hello>       -e 's/@''GNULIB_FREOPEN''@/0/g' \\
hello>       -e 's/@''GNULIB_FSCANF''@/1/g' \\
hello>       -e 's/@''GNULIB_FSEEK''@/0/g' \\
hello>       -e 's/@''GNULIB_FSEEKO''@/0/g' \\
hello>       -e 's/@''GNULIB_FTELL''@/0/g' \\
hello>       -e 's/@''GNULIB_FTELLO''@/0/g' \\
hello>       -e 's/@''GNULIB_FWRITE''@/1/g' \\
hello>       -e 's/@''GNULIB_GETC''@/1/g' \\
hello>       -e 's/@''GNULIB_GETCHAR''@/1/g' \\
hello>       -e 's/@''GNULIB_GETDELIM''@/0/g' \\
hello>       -e 's/@''GNULIB_GETLINE''@/0/g' \\
hello>       -e 's/@''GNULIB_OBSTACK_PRINTF''@/0/g' \\
hello>       -e 's/@''GNULIB_OBSTACK_PRINTF_POSIX''@/0/g' \\
hello>       -e 's/@''GNULIB_PCLOSE''@/0/g' \\
hello>       -e 's/@''GNULIB_PERROR''@/0/g' \\
hello>       -e 's/@''GNULIB_POPEN''@/0/g' \\
hello>       -e 's/@''GNULIB_PRINTF''@/1/g' \\
hello>       -e 's/@''GNULIB_PRINTF_POSIX''@/0/g' \\
hello>       -e 's/@''GNULIB_PUTC''@/1/g' \\
hello>       -e 's/@''GNULIB_PUTCHAR''@/1/g' \\
hello>       -e 's/@''GNULIB_PUTS''@/1/g' \\
hello>       -e 's/@''GNULIB_REMOVE''@/0/g' \\
hello>       -e 's/@''GNULIB_RENAME''@/0/g' \\
hello>       -e 's/@''GNULIB_RENAMEAT''@/0/g' \\
hello>       -e 's/@''GNULIB_SCANF''@/1/g' \\
hello>       -e 's/@''GNULIB_SNPRINTF''@/0/g' \\
hello>       -e 's/@''GNULIB_SPRINTF_POSIX''@/0/g' \\
hello>       -e 's/@''GNULIB_STDIO_H_NONBLOCKING''@/0/g' \\
hello>       -e 's/@''GNULIB_STDIO_H_SIGPIPE''@/0/g' \\
hello>       -e 's/@''GNULIB_TMPFILE''@/0/g' \\
hello>       -e 's/@''GNULIB_VASPRINTF''@/0/g' \\
hello>       -e 's/@''GNULIB_VDPRINTF''@/0/g' \\
hello>       -e 's/@''GNULIB_VFPRINTF''@/1/g' \\
hello>       -e 's/@''GNULIB_VFPRINTF_POSIX''@/0/g' \\
hello>       -e 's/@''GNULIB_VFSCANF''@/0/g' \\
hello>       -e 's/@''GNULIB_VSCANF''@/0/g' \\
hello>       -e 's/@''GNULIB_VPRINTF''@/1/g' \\
hello>       -e 's/@''GNULIB_VPRINTF_POSIX''@/0/g' \\
hello>       -e 's/@''GNULIB_VSNPRINTF''@/0/g' \\
hello>       -e 's/@''GNULIB_VSPRINTF_POSIX''@/0/g' \\
hello>       -e 's/@''GNULIB_MDA_FCLOSEALL''@/1/g' \\
hello>       -e 's/@''GNULIB_MDA_FDOPEN''@/1/g' \\
hello>       -e 's/@''GNULIB_MDA_FILENO''@/1/g' \\
hello>       -e 's/@''GNULIB_MDA_GETW''@/1/g' \\
hello>       -e 's/@''GNULIB_MDA_PUTW''@/1/g' \\
hello>       -e 's/@''GNULIB_MDA_TEMPNAM''@/1/g' \\
hello>       < ./lib/stdio.in.h | \\
hello>   sed -e 's|@''HAVE_DECL_FCLOSEALL''@|1|g' \\
hello>       -e 's|@''HAVE_DECL_FPURGE''@|1|g' \\
hello>       -e 's|@''HAVE_DECL_FSEEKO''@|1|g' \\
hello>       -e 's|@''HAVE_DECL_FTELLO''@|1|g' \\
hello>       -e 's|@''HAVE_DECL_GETDELIM''@|1|g' \\
hello>       -e 's|@''HAVE_DECL_GETLINE''@|1|g' \\
hello>       -e 's|@''HAVE_DECL_OBSTACK_PRINTF''@|1|g' \\
hello>       -e 's|@''HAVE_DECL_SNPRINTF''@|1|g' \\
hello>       -e 's|@''HAVE_DECL_VSNPRINTF''@|1|g' \\
hello>       -e 's|@''HAVE_DPRINTF''@|1|g' \\
hello>       -e 's|@''HAVE_FSEEKO''@|1|g' \\
hello>       -e 's|@''HAVE_FTELLO''@|1|g' \\
hello>       -e 's|@''HAVE_PCLOSE''@|1|g' \\
hello>       -e 's|@''HAVE_POPEN''@|1|g' \\
hello>       -e 's|@''HAVE_RENAMEAT''@|1|g' \\
hello>       -e 's|@''HAVE_VASPRINTF''@|1|g' \\
hello>       -e 's|@''HAVE_VDPRINTF''@|1|g' \\
hello>       -e 's|@''REPLACE_DPRINTF''@|0|g' \\
hello>       -e 's|@''REPLACE_FCLOSE''@|0|g' \\
hello>       -e 's|@''REPLACE_FDOPEN''@|0|g' \\
hello>       -e 's|@''REPLACE_FFLUSH''@|0|g' \\
hello>       -e 's|@''REPLACE_FOPEN''@|0|g' \\
hello>       -e 's|@''REPLACE_FPRINTF''@|0|g' \\
hello>       -e 's|@''REPLACE_FPURGE''@|0|g' \\
hello>       -e 's|@''REPLACE_FREOPEN''@|0|g' \\
hello>       -e 's|@''REPLACE_FSEEK''@|0|g' \\
hello>       -e 's|@''REPLACE_FSEEKO''@|0|g' \\
hello>       -e 's|@''REPLACE_FTELL''@|0|g' \\
hello>       -e 's|@''REPLACE_FTELLO''@|0|g' \\
hello>       -e 's|@''REPLACE_GETDELIM''@|0|g' \\
hello>       -e 's|@''REPLACE_GETLINE''@|0|g' \\
hello>       -e 's|@''REPLACE_OBSTACK_PRINTF''@|0|g' \\
hello>       -e 's|@''REPLACE_PERROR''@|0|g' \\
hello>       -e 's|@''REPLACE_POPEN''@|0|g' \\
hello>       -e 's|@''REPLACE_PRINTF''@|0|g' \\
hello>       -e 's|@''REPLACE_REMOVE''@|0|g' \\
hello>       -e 's|@''REPLACE_RENAME''@|0|g' \\
hello>       -e 's|@''REPLACE_RENAMEAT''@|0|g' \\
hello>       -e 's|@''REPLACE_SNPRINTF''@|0|g' \\
hello>       -e 's|@''REPLACE_SPRINTF''@|0|g' \\
hello>       -e 's|@''REPLACE_STDIO_READ_FUNCS''@|0|g' \\
hello>       -e 's|@''REPLACE_STDIO_WRITE_FUNCS''@|0|g' \\
hello>       -e 's|@''REPLACE_TMPFILE''@|0|g' \\
hello>       -e 's|@''REPLACE_VASPRINTF''@|0|g' \\
hello>       -e 's|@''REPLACE_VDPRINTF''@|0|g' \\
hello>       -e 's|@''REPLACE_VFPRINTF''@|0|g' \\
hello>       -e 's|@''REPLACE_VPRINTF''@|0|g' \\
hello>       -e 's|@''REPLACE_VSNPRINTF''@|0|g' \\
hello>       -e 's|@''REPLACE_VSPRINTF''@|0|g' \\
hello>       -e 's|@''ASM_SYMBOL_PREFIX''@||g' \\
hello>       -e '/definitions of _GL_FUNCDECL_RPL/r ./lib/c++defs.h' \\
hello>       -e '/definition of _GL_ARG_NONNULL/r ./lib/arg-nonnull.h' \\
hello>       -e '/definition of _GL_WARN_ON_USE/r ./lib/warn-on-use.h'; \\
hello> } > lib/stdio.h-t && \\
hello> mv lib/stdio.h-t lib/stdio.h
hello> rm -f lib/stdlib.h-t lib/stdlib.h && \\
hello> { echo '/* DO NOT EDIT! GENERATED AUTOMATICALLY! */' && \\
hello>   sed -e 's|@''GUARD_PREFIX''@|GL|g' \\
hello>       -e 's|@''INCLUDE_NEXT''@|include_next|g' \\
hello>       -e 's|@''PRAGMA_SYSTEM_HEADER''@|#pragma GCC system_header|g' \\
hello>       -e 's|@''PRAGMA_COLUMNS''@||g' \\
hello>       -e 's|@''NEXT_STDLIB_H''@|<stdlib.h>|g' \\
hello>       -e 's/@''GNULIB__EXIT''@/0/g' \\
hello>       -e 's/@''GNULIB_ALIGNED_ALLOC''@/0/g' \\
hello>       -e 's/@''GNULIB_ATOLL''@/0/g' \\
hello>       -e 's/@''GNULIB_CALLOC_POSIX''@/0/g' \\
hello>       -e 's/@''GNULIB_CANONICALIZE_FILE_NAME''@/0/g' \\
hello>       -e 's/@''GNULIB_FREE_POSIX''@/0/g' \\
hello>       -e 's/@''GNULIB_GETLOADAVG''@/0/g' \\
hello>       -e 's/@''GNULIB_GETSUBOPT''@/0/g' \\
hello>       -e 's/@''GNULIB_GRANTPT''@/0/g' \\
hello>       -e 's/@''GNULIB_MALLOC_POSIX''@/1/g' \\
hello>       -e 's/@''GNULIB_MBTOWC''@/0/g' \\
hello>       -e 's/@''GNULIB_MKDTEMP''@/0/g' \\
hello>       -e 's/@''GNULIB_MKOSTEMP''@/0/g' \\
hello>       -e 's/@''GNULIB_MKOSTEMPS''@/0/g' \\
hello>       -e 's/@''GNULIB_MKSTEMP''@/0/g' \\
hello>       -e 's/@''GNULIB_MKSTEMPS''@/0/g' \\
hello>       -e 's/@''GNULIB_POSIX_MEMALIGN''@/0/g' \\
hello>       -e 's/@''GNULIB_POSIX_OPENPT''@/0/g' \\
hello>       -e 's/@''GNULIB_PTSNAME''@/0/g' \\
hello>       -e 's/@''GNULIB_PTSNAME_R''@/0/g' \\
hello>       -e 's/@''GNULIB_PUTENV''@/0/g' \\
hello>       -e 's/@''GNULIB_QSORT_R''@/0/g' \\
hello>       -e 's/@''GNULIB_RANDOM''@/0/g' \\
hello>       -e 's/@''GNULIB_RANDOM_R''@/0/g' \\
hello>       -e 's/@''GNULIB_REALLOC_POSIX''@/0/g' \\
hello>       -e 's/@''GNULIB_REALLOCARRAY''@/0/g' \\
hello>       -e 's/@''GNULIB_REALPATH''@/0/g' \\
hello>       -e 's/@''GNULIB_RPMATCH''@/0/g' \\
hello>       -e 's/@''GNULIB_SECURE_GETENV''@/0/g' \\
hello>       -e 's/@''GNULIB_SETENV''@/0/g' \\
hello>       -e 's/@''GNULIB_STRTOD''@/0/g' \\
hello>       -e 's/@''GNULIB_STRTOLD''@/0/g' \\
hello>       -e 's/@''GNULIB_STRTOLL''@/0/g' \\
hello>       -e 's/@''GNULIB_STRTOULL''@/0/g' \\
hello>       -e 's/@''GNULIB_SYSTEM_POSIX''@/0/g' \\
hello>       -e 's/@''GNULIB_UNLOCKPT''@/0/g' \\
hello>       -e 's/@''GNULIB_UNSETENV''@/0/g' \\
hello>       -e 's/@''GNULIB_WCTOMB''@/0/g' \\
hello>       -e 's/@''GNULIB_MDA_ECVT''@/1/g' \\
hello>       -e 's/@''GNULIB_MDA_FCVT''@/1/g' \\
hello>       -e 's/@''GNULIB_MDA_GCVT''@/1/g' \\
hello>       -e 's/@''GNULIB_MDA_MKTEMP''@/1/g' \\
hello>       -e 's/@''GNULIB_MDA_PUTENV''@/1/g' \\
hello>       < ./lib/stdlib.in.h | \\
hello>   sed -e 's|@''HAVE__EXIT''@|1|g' \\
hello>       -e 's|@''HAVE_ALIGNED_ALLOC''@|1|g' \\
hello>       -e 's|@''HAVE_ATOLL''@|1|g' \\
hello>       -e 's|@''HAVE_CANONICALIZE_FILE_NAME''@|1|g' \\
hello>       -e 's|@''HAVE_DECL_ECVT''@|1|g' \\
hello>       -e 's|@''HAVE_DECL_FCVT''@|1|g' \\
hello>       -e 's|@''HAVE_DECL_GCVT''@|1|g' \\
hello>       -e 's|@''HAVE_DECL_GETLOADAVG''@|1|g' \\
hello>       -e 's|@''HAVE_GETSUBOPT''@|1|g' \\
hello>       -e 's|@''HAVE_GRANTPT''@|1|g' \\
hello>       -e 's|@''HAVE_INITSTATE''@|1|g' \\
hello>       -e 's|@''HAVE_DECL_INITSTATE''@|1|g' \\
hello>       -e 's|@''HAVE_MBTOWC''@|1|g' \\
hello>       -e 's|@''HAVE_MKDTEMP''@|1|g' \\
hello>       -e 's|@''HAVE_MKOSTEMP''@|1|g' \\
hello>       -e 's|@''HAVE_MKOSTEMPS''@|1|g' \\
hello>       -e 's|@''HAVE_MKSTEMP''@|1|g' \\
hello>       -e 's|@''HAVE_MKSTEMPS''@|1|g' \\
hello>       -e 's|@''HAVE_POSIX_MEMALIGN''@|1|g' \\
hello>       -e 's|@''HAVE_POSIX_OPENPT''@|1|g' \\
hello>       -e 's|@''HAVE_PTSNAME''@|1|g' \\
hello>       -e 's|@''HAVE_PTSNAME_R''@|1|g' \\
hello>       -e 's|@''HAVE_QSORT_R''@|1|g' \\
hello>       -e 's|@''HAVE_RANDOM''@|1|g' \\
hello>       -e 's|@''HAVE_RANDOM_H''@|1|g' \\
hello>       -e 's|@''HAVE_RANDOM_R''@|1|g' \\
hello>       -e 's|@''HAVE_REALLOCARRAY''@|1|g' \\
hello>       -e 's|@''HAVE_REALPATH''@|1|g' \\
hello>       -e 's|@''HAVE_RPMATCH''@|1|g' \\
hello>       -e 's|@''HAVE_SECURE_GETENV''@|1|g' \\
hello>       -e 's|@''HAVE_DECL_SETENV''@|1|g' \\
hello>       -e 's|@''HAVE_SETSTATE''@|1|g' \\
hello>       -e 's|@''HAVE_DECL_SETSTATE''@|1|g' \\
hello>       -e 's|@''HAVE_STRTOD''@|1|g' \\
hello>       -e 's|@''HAVE_STRTOLD''@|1|g' \\
hello>       -e 's|@''HAVE_STRTOLL''@|1|g' \\
hello>       -e 's|@''HAVE_STRTOULL''@|1|g' \\
hello>       -e 's|@''HAVE_STRUCT_RANDOM_DATA''@|1|g' \\
hello>       -e 's|@''HAVE_SYS_LOADAVG_H''@|0|g' \\
hello>       -e 's|@''HAVE_UNLOCKPT''@|1|g' \\
hello>       -e 's|@''HAVE_DECL_UNSETENV''@|1|g' \\
hello>       -e 's|@''REPLACE_ALIGNED_ALLOC''@|0|g' \\
hello>       -e 's|@''REPLACE_CALLOC''@|0|g' \\
hello>       -e 's|@''REPLACE_CANONICALIZE_FILE_NAME''@|0|g' \\
hello>       -e 's|@''REPLACE_FREE''@|0|g' \\
hello>       -e 's|@''REPLACE_INITSTATE''@|0|g' \\
hello>       -e 's|@''REPLACE_MALLOC''@|0|g' \\
hello>       -e 's|@''REPLACE_MBTOWC''@|0|g' \\
hello>       -e 's|@''REPLACE_MKSTEMP''@|0|g' \\
hello>       -e 's|@''REPLACE_POSIX_MEMALIGN''@|0|g' \\
hello>       -e 's|@''REPLACE_PTSNAME''@|0|g' \\
hello>       -e 's|@''REPLACE_PTSNAME_R''@|0|g' \\
hello>       -e 's|@''REPLACE_PUTENV''@|0|g' \\
hello>       -e 's|@''REPLACE_QSORT_R''@|0|g' \\
hello>       -e 's|@''REPLACE_RANDOM''@|0|g' \\
hello>       -e 's|@''REPLACE_RANDOM_R''@|0|g' \\
hello>       -e 's|@''REPLACE_REALLOC''@|0|g' \\
hello>       -e 's|@''REPLACE_REALPATH''@|0|g' \\
hello>       -e 's|@''REPLACE_SETENV''@|0|g' \\
hello>       -e 's|@''REPLACE_SETSTATE''@|0|g' \\
hello>       -e 's|@''REPLACE_STRTOD''@|0|g' \\
hello>       -e 's|@''REPLACE_STRTOLD''@|0|g' \\
hello>       -e 's|@''REPLACE_UNSETENV''@|0|g' \\
hello>       -e 's|@''REPLACE_WCTOMB''@|0|g' \\
hello>       -e '/definitions of _GL_FUNCDECL_RPL/r ./lib/c++defs.h' \\
hello>       -e '/definition of _Noreturn/r ./lib/_Noreturn.h' \\
hello>       -e '/definition of _GL_ARG_NONNULL/r ./lib/arg-nonnull.h' \\
hello>       -e '/definition of _GL_WARN_ON_USE/r ./lib/warn-on-use.h'; \\
hello> } > lib/stdlib.h-t && \\
hello> mv lib/stdlib.h-t lib/stdlib.h
hello> rm -f lib/string.h-t lib/string.h && \\
hello> { echo '/* DO NOT EDIT! GENERATED AUTOMATICALLY! */' && \\
hello>   sed -e 's|@''GUARD_PREFIX''@|GL|g' \\
hello>       -e 's|@''INCLUDE_NEXT''@|include_next|g' \\
hello>       -e 's|@''PRAGMA_SYSTEM_HEADER''@|#pragma GCC system_header|g' \\
hello>       -e 's|@''PRAGMA_COLUMNS''@||g' \\
hello>       -e 's|@''NEXT_STRING_H''@|<string.h>|g' \\
hello>       -e 's/@''GNULIB_EXPLICIT_BZERO''@/0/g' \\
hello>       -e 's/@''GNULIB_FFSL''@/0/g' \\
hello>       -e 's/@''GNULIB_FFSLL''@/0/g' \\
hello>       -e 's/@''GNULIB_MBSLEN''@/1/g' \\
hello>       -e 's/@''GNULIB_MBSNLEN''@/0/g' \\
hello>       -e 's/@''GNULIB_MBSCHR''@/0/g' \\
hello>       -e 's/@''GNULIB_MBSRCHR''@/0/g' \\
hello>       -e 's/@''GNULIB_MBSSTR''@/1/g' \\
hello>       -e 's/@''GNULIB_MBSCASECMP''@/0/g' \\
hello>       -e 's/@''GNULIB_MBSNCASECMP''@/0/g' \\
hello>       -e 's/@''GNULIB_MBSPCASECMP''@/0/g' \\
hello>       -e 's/@''GNULIB_MBSCASESTR''@/0/g' \\
hello>       -e 's/@''GNULIB_MBSCSPN''@/0/g' \\
hello>       -e 's/@''GNULIB_MBSPBRK''@/0/g' \\
hello>       -e 's/@''GNULIB_MBSSPN''@/0/g' \\
hello>       -e 's/@''GNULIB_MBSSEP''@/0/g' \\
hello>       -e 's/@''GNULIB_MBSTOK_R''@/0/g' \\
hello>       -e 's/@''GNULIB_MEMCHR''@/1/g' \\
hello>       -e 's/@''GNULIB_MEMMEM''@/0/g' \\
hello>       -e 's/@''GNULIB_MEMPCPY''@/0/g' \\
hello>       -e 's/@''GNULIB_MEMRCHR''@/0/g' \\
hello>       -e 's/@''GNULIB_RAWMEMCHR''@/0/g' \\
hello>       -e 's/@''GNULIB_STPCPY''@/0/g' \\
hello>       -e 's/@''GNULIB_STPNCPY''@/0/g' \\
hello>       -e 's/@''GNULIB_STRCHRNUL''@/0/g' \\
hello>       -e 's/@''GNULIB_STRDUP''@/0/g' \\
hello>       -e 's/@''GNULIB_STRNCAT''@/0/g' \\
hello>       -e 's/@''GNULIB_STRNDUP''@/1/g' \\
hello>       -e 's/@''GNULIB_STRNLEN''@/1/g' \\
hello>       -e 's/@''GNULIB_STRPBRK''@/0/g' \\
hello>       -e 's/@''GNULIB_STRSEP''@/0/g' \\
hello>       -e 's/@''GNULIB_STRSTR''@/0/g' \\
hello>       -e 's/@''GNULIB_STRCASESTR''@/0/g' \\
hello>       -e 's/@''GNULIB_STRTOK_R''@/0/g' \\
hello>       -e 's/@''GNULIB_STRERROR''@/1/g' \\
hello>       -e 's/@''GNULIB_STRERROR_R''@/0/g' \\
hello>       -e 's/@''GNULIB_STRERRORNAME_NP''@/0/g' \\
hello>       -e 's/@''GNULIB_SIGABBREV_NP''@/0/g' \\
hello>       -e 's/@''GNULIB_SIGDESCR_NP''@/0/g' \\
hello>       -e 's/@''GNULIB_STRSIGNAL''@/0/g' \\
hello>       -e 's/@''GNULIB_STRVERSCMP''@/0/g' \\
hello>       -e 's/@''GNULIB_MDA_MEMCCPY''@/1/g' \\
hello>       -e 's/@''GNULIB_MDA_STRDUP''@/1/g' \\
hello>       < ./lib/string.in.h | \\
hello>   sed -e 's|@''HAVE_EXPLICIT_BZERO''@|1|g' \\
hello>       -e 's|@''HAVE_FFSL''@|1|g' \\
hello>       -e 's|@''HAVE_FFSLL''@|1|g' \\
hello>       -e 's|@''HAVE_MBSLEN''@|0|g' \\
hello>       -e 's|@''HAVE_DECL_MEMMEM''@|1|g' \\
hello>       -e 's|@''HAVE_MEMPCPY''@|1|g' \\
hello>       -e 's|@''HAVE_DECL_MEMRCHR''@|1|g' \\
hello>       -e 's|@''HAVE_RAWMEMCHR''@|1|g' \\
hello>       -e 's|@''HAVE_STPCPY''@|1|g' \\
hello>       -e 's|@''HAVE_STPNCPY''@|1|g' \\
hello>       -e 's|@''HAVE_STRCHRNUL''@|1|g' \\
hello>       -e 's|@''HAVE_DECL_STRDUP''@|1|g' \\
hello>       -e 's|@''HAVE_DECL_STRNDUP''@|1|g' \\
hello>       -e 's|@''HAVE_DECL_STRNLEN''@|1|g' \\
hello>       -e 's|@''HAVE_STRPBRK''@|1|g' \\
hello>       -e 's|@''HAVE_STRSEP''@|1|g' \\
hello>       -e 's|@''HAVE_STRCASESTR''@|1|g' \\
hello>       -e 's|@''HAVE_DECL_STRTOK_R''@|1|g' \\
hello>       -e 's|@''HAVE_DECL_STRERROR_R''@|1|g' \\
hello>       -e 's|@''HAVE_STRERRORNAME_NP''@|1|g' \\
hello>       -e 's|@''HAVE_SIGABBREV_NP''@|1|g' \\
hello>       -e 's|@''HAVE_SIGDESCR_NP''@|1|g' \\
hello>       -e 's|@''HAVE_DECL_STRSIGNAL''@|1|g' \\
hello>       -e 's|@''HAVE_STRVERSCMP''@|1|g' \\
hello>       -e 's|@''REPLACE_MEMCHR''@|0|g' \\
hello>       -e 's|@''REPLACE_MEMMEM''@|0|g' \\
hello>       -e 's|@''REPLACE_STPNCPY''@|0|g' \\
hello>       -e 's|@''REPLACE_STRCHRNUL''@|0|g' \\
hello>       -e 's|@''REPLACE_STRDUP''@|0|g' \\
hello>       -e 's|@''REPLACE_STRNCAT''@|0|g' \\
hello>       -e 's|@''REPLACE_STRNDUP''@|0|g' \\
hello>       -e 's|@''REPLACE_STRNLEN''@|0|g' \\
hello>       -e 's|@''REPLACE_STRSTR''@|0|g' \\
hello>       -e 's|@''REPLACE_STRCASESTR''@|0|g' \\
hello>       -e 's|@''REPLACE_STRTOK_R''@|0|g' \\
hello>       -e 's|@''REPLACE_STRERROR''@|0|g' \\
hello>       -e 's|@''REPLACE_STRERROR_R''@|0|g' \\
hello>       -e 's|@''REPLACE_STRERRORNAME_NP''@|0|g' \\
hello>       -e 's|@''REPLACE_STRSIGNAL''@|0|g' \\
hello>       -e 's|@''UNDEFINE_STRTOK_R''@|0|g' \\
hello>       -e '/definitions of _GL_FUNCDECL_RPL/r ./lib/c++defs.h' \\
hello>       -e '/definition of _GL_ARG_NONNULL/r ./lib/arg-nonnull.h' \\
hello>       -e '/definition of _GL_WARN_ON_USE/r ./lib/warn-on-use.h'; \\
hello>       < ./lib/string.in.h; \\
hello> } > lib/string.h-t && \\
hello> mv lib/string.h-t lib/string.h
hello> /nix/store/87fck6hm17chxjq7badb11mq036zbyv9-coreutils-9.7/bin/mkdir -p lib/sys
hello> rm -f lib/sys/stat.h-t lib/sys/stat.h && \\
hello> { echo '/* DO NOT EDIT! GENERATED AUTOMATICALLY! */'; \\
hello>   sed -e 's|@''GUARD_PREFIX''@|GL|g' \\
hello>       -e 's|@''INCLUDE_NEXT''@|include_next|g' \\
hello>       -e 's|@''PRAGMA_SYSTEM_HEADER''@|#pragma GCC system_header|g' \\
hello>       -e 's|@''PRAGMA_COLUMNS''@||g' \\
hello>       -e 's|@''NEXT_SYS_STAT_H''@|<sys/stat.h>|g' \\
hello>       -e 's|@''WINDOWS_64_BIT_ST_SIZE''@|0|g' \\
hello>       -e 's|@''WINDOWS_STAT_TIMESPEC''@|0|g' \\
hello>       -e 's/@''GNULIB_FCHMODAT''@/0/g' \\
hello>       -e 's/@''GNULIB_FSTAT''@/1/g' \\
hello>       -e 's/@''GNULIB_FSTATAT''@/0/g' \\
hello>       -e 's/@''GNULIB_FUTIMENS''@/0/g' \\
hello>       -e 's/@''GNULIB_GETUMASK''@/0/g' \\
hello>       -e 's/@''GNULIB_LCHMOD''@/0/g' \\
hello>       -e 's/@''GNULIB_LSTAT''@/0/g' \\
hello>       -e 's/@''GNULIB_MKDIR''@/0/g' \\
hello>       -e 's/@''GNULIB_MKDIRAT''@/0/g' \\
hello>       -e 's/@''GNULIB_MKFIFO''@/0/g' \\
hello>       -e 's/@''GNULIB_MKFIFOAT''@/0/g' \\
hello>       -e 's/@''GNULIB_MKNOD''@/0/g' \\
hello>       -e 's/@''GNULIB_MKNODAT''@/0/g' \\
hello>       -e 's/@''GNULIB_STAT''@/1/g' \\
hello>       -e 's/@''GNULIB_UTIMENSAT''@/0/g' \\
hello>       -e 's/@''GNULIB_OVERRIDES_STRUCT_STAT''@/0/g' \\
hello>       -e 's/@''GNULIB_MDA_CHMOD''@/1/g' \\
hello>       -e 's/@''GNULIB_MDA_MKDIR''@/1/g' \\
hello>       -e 's/@''GNULIB_MDA_UMASK''@/1/g' \\
hello>       -e 's|@''HAVE_FCHMODAT''@|1|g' \\
hello>       -e 's|@''HAVE_FSTATAT''@|1|g' \\
hello>       -e 's|@''HAVE_FUTIMENS''@|1|g' \\
hello>       -e 's|@''HAVE_GETUMASK''@|1|g' \\
hello>       -e 's|@''HAVE_LCHMOD''@|1|g' \\
hello>       -e 's|@''HAVE_LSTAT''@|1|g' \\
hello>       -e 's|@''HAVE_MKDIRAT''@|1|g' \\
hello>       -e 's|@''HAVE_MKFIFO''@|1|g' \\
hello>       -e 's|@''HAVE_MKFIFOAT''@|1|g' \\
hello>       -e 's|@''HAVE_MKNOD''@|1|g' \\
hello>       -e 's|@''HAVE_MKNODAT''@|1|g' \\
hello>       -e 's|@''HAVE_UTIMENSAT''@|1|g' \\
hello>       -e 's|@''REPLACE_FCHMODAT''@|0|g' \\
hello>       -e 's|@''REPLACE_FSTAT''@|0|g' \\
hello>       -e 's|@''REPLACE_FSTATAT''@|0|g' \\
hello>       -e 's|@''REPLACE_FUTIMENS''@|0|g' \\
hello>       -e 's|@''REPLACE_LSTAT''@|0|g' \\
hello>       -e 's|@''REPLACE_MKDIR''@|0|g' \\
hello>       -e 's|@''REPLACE_MKFIFO''@|0|g' \\
hello>       -e 's|@''REPLACE_MKNOD''@|0|g' \\
hello>       -e 's|@''REPLACE_STAT''@|0|g' \\
hello>       -e 's|@''REPLACE_UTIMENSAT''@|0|g' \\
hello>       -e '/definitions of _GL_FUNCDECL_RPL/r ./lib/c++defs.h' \\
hello>       -e '/definition of _GL_ARG_NONNULL/r ./lib/arg-nonnull.h' \\
hello>       -e '/definition of _GL_WARN_ON_USE/r ./lib/warn-on-use.h' \\
hello>       < ./lib/sys_stat.in.h; \\
hello> } > lib/sys/stat.h-t && \\
hello> mv lib/sys/stat.h-t lib/sys/stat.h
hello> /nix/store/87fck6hm17chxjq7badb11mq036zbyv9-coreutils-9.7/bin/mkdir -p lib/sys
hello> rm -f lib/sys/types.h-t lib/sys/types.h && \\
hello> { echo '/* DO NOT EDIT! GENERATED AUTOMATICALLY! */'; \\
hello>   sed -e 's|@''GUARD_PREFIX''@|GL|g' \\
hello>       -e 's|@''INCLUDE_NEXT''@|include_next|g' \\
hello>       -e 's|@''PRAGMA_SYSTEM_HEADER''@|#pragma GCC system_header|g' \\
hello>       -e 's|@''PRAGMA_COLUMNS''@||g' \\
hello>       -e 's|@''NEXT_SYS_TYPES_H''@|<sys/types.h>|g' \\
hello>       -e 's|@''WINDOWS_64_BIT_OFF_T''@|0|g' \\
hello>       -e 's|@''WINDOWS_STAT_INODES''@|0|g' \\
hello>       < ./lib/sys_types.in.h; \\
hello> } > lib/sys/types.h-t && \\
hello> mv lib/sys/types.h-t lib/sys/types.h
hello> rm -f lib/time.h-t lib/time.h && \\
hello> { echo '/* DO NOT EDIT! GENERATED AUTOMATICALLY! */' && \\
hello>   sed -e 's|@''GUARD_PREFIX''@|GL|g' \\
hello>       -e 's|@''INCLUDE_NEXT''@|include_next|g' \\
hello>       -e 's|@''PRAGMA_SYSTEM_HEADER''@|#pragma GCC system_header|g' \\
hello>       -e 's|@''PRAGMA_COLUMNS''@||g' \\
hello>       -e 's|@''NEXT_TIME_H''@|<time.h>|g' \\
hello>       -e 's/@''GNULIB_CTIME''@/0/g' \\
hello>       -e 's/@''GNULIB_LOCALTIME''@/0/g' \\
hello>       -e 's/@''GNULIB_MKTIME''@/0/g' \\
hello>       -e 's/@''GNULIB_NANOSLEEP''@/0/g' \\
hello>       -e 's/@''GNULIB_STRFTIME''@/0/g' \\
hello>       -e 's/@''GNULIB_STRPTIME''@/0/g' \\
hello>       -e 's/@''GNULIB_TIMEGM''@/0/g' \\
hello>       -e 's/@''GNULIB_TIME_R''@/0/g' \\
hello>       -e 's/@''GNULIB_TIME_RZ''@/0/g' \\
hello>       -e 's/@''GNULIB_TZSET''@/0/g' \\
hello>       -e 's/@''GNULIB_MDA_TZSET''@/1/g' \\
hello>       -e 's|@''HAVE_DECL_LOCALTIME_R''@|1|g' \\
hello>       -e 's|@''HAVE_NANOSLEEP''@|1|g' \\
hello>       -e 's|@''HAVE_STRPTIME''@|1|g' \\
hello>       -e 's|@''HAVE_TIMEGM''@|1|g' \\
hello>       -e 's|@''HAVE_TIMEZONE_T''@|0|g' \\
hello>       -e 's|@''REPLACE_CTIME''@|GNULIB_PORTCHECK|g' \\
hello>       -e 's|@''REPLACE_GMTIME''@|0|g' \\
hello>       -e 's|@''REPLACE_LOCALTIME''@|0|g' \\
hello>       -e 's|@''REPLACE_LOCALTIME_R''@|GNULIB_PORTCHECK|g' \\
hello>       -e 's|@''REPLACE_MKTIME''@|GNULIB_PORTCHECK|g' \\
hello>       -e 's|@''REPLACE_NANOSLEEP''@|GNULIB_PORTCHECK|g' \\
hello>       -e 's|@''REPLACE_STRFTIME''@|GNULIB_PORTCHECK|g' \\
hello>       -e 's|@''REPLACE_TIMEGM''@|GNULIB_PORTCHECK|g' \\
hello>       -e 's|@''REPLACE_TZSET''@|GNULIB_PORTCHECK|g' \\
hello>       -e 's|@''PTHREAD_H_DEFINES_STRUCT_TIMESPEC''@|0|g' \\
hello>       -e 's|@''SYS_TIME_H_DEFINES_STRUCT_TIMESPEC''@|0|g' \\
hello>       -e 's|@''TIME_H_DEFINES_STRUCT_TIMESPEC''@|1|g' \\
hello>       -e 's|@''UNISTD_H_DEFINES_STRUCT_TIMESPEC''@|0|g' \\
hello>       -e '/definitions of _GL_FUNCDECL_RPL/r ./lib/c++defs.h' \\
hello>       -e '/definition of _GL_ARG_NONNULL/r ./lib/arg-nonnull.h' \\
hello>       -e '/definition of _GL_WARN_ON_USE/r ./lib/warn-on-use.h' \\
hello>       < ./lib/time.in.h; \\
hello> } > lib/time.h-t && \\
hello> mv lib/time.h-t lib/time.h
hello> rm -f lib/unistd.h-t lib/unistd.h && \\
hello> { echo '/* DO NOT EDIT! GENERATED AUTOMATICALLY! */'; \\
hello>   sed -e 's|@''GUARD_PREFIX''@|GL|g' \\
hello>       -e 's|@''HAVE_UNISTD_H''@|1|g' \\
hello>       -e 's|@''INCLUDE_NEXT''@|include_next|g' \\
hello>       -e 's|@''PRAGMA_SYSTEM_HEADER''@|#pragma GCC system_header|g' \\
hello>       -e 's|@''PRAGMA_COLUMNS''@||g' \\
hello>       -e 's|@''NEXT_UNISTD_H''@|<unistd.h>|g' \\
hello>       -e 's|@''WINDOWS_64_BIT_OFF_T''@|0|g' \\
hello>       -e 's/@''GNULIB_ACCESS''@/0/g' \\
hello>       -e 's/@''GNULIB_CHDIR''@/0/g' \\
hello>       -e 's/@''GNULIB_CHOWN''@/0/g' \\
hello>       -e 's/@''GNULIB_CLOSE''@/1/g' \\
hello>       -e 's/@''GNULIB_COPY_FILE_RANGE''@/0/g' \\
hello>       -e 's/@''GNULIB_DUP''@/0/g' \\
hello>       -e 's/@''GNULIB_DUP2''@/1/g' \\
hello>       -e 's/@''GNULIB_DUP3''@/0/g' \\
hello>       -e 's/@''GNULIB_ENVIRON''@/0/g' \\
hello>       -e 's/@''GNULIB_EUIDACCESS''@/0/g' \\
hello>       -e 's/@''GNULIB_EXECL''@/0/g' \\
hello>       -e 's/@''GNULIB_EXECLE''@/0/g' \\
hello>       -e 's/@''GNULIB_EXECLP''@/0/g' \\
hello>       -e 's/@''GNULIB_EXECV''@/0/g' \\
hello>       -e 's/@''GNULIB_EXECVE''@/0/g' \\
hello>       -e 's/@''GNULIB_EXECVP''@/0/g' \\
hello>       -e 's/@''GNULIB_EXECVPE''@/0/g' \\
hello>       -e 's/@''GNULIB_FACCESSAT''@/0/g' \\
hello>       -e 's/@''GNULIB_FCHDIR''@/0/g' \\
hello>       -e 's/@''GNULIB_FCHOWNAT''@/0/g' \\
hello>       -e 's/@''GNULIB_FDATASYNC''@/0/g' \\
hello>       -e 's/@''GNULIB_FSYNC''@/0/g' \\
hello>       -e 's/@''GNULIB_FTRUNCATE''@/0/g' \\
hello>       -e 's/@''GNULIB_GETCWD''@/0/g' \\
hello>       -e 's/@''GNULIB_GETDOMAINNAME''@/0/g' \\
hello>       -e 's/@''GNULIB_GETDTABLESIZE''@/1/g' \\
hello>       -e 's/@''GNULIB_GETENTROPY''@/0/g' \\
hello>       -e 's/@''GNULIB_GETGROUPS''@/0/g' \\
hello>       -e 's/@''GNULIB_GETHOSTNAME''@/0/g' \\
hello>       -e 's/@''GNULIB_GETLOGIN''@/0/g' \\
hello>       -e 's/@''GNULIB_GETLOGIN_R''@/0/g' \\
hello>       -e 's/@''GNULIB_GETOPT_POSIX''@/1/g' \\
hello>       -e 's/@''GNULIB_GETPAGESIZE''@/0/g' \\
hello>       -e 's/@''GNULIB_GETPASS''@/0/g' \\
hello>       -e 's/@''GNULIB_GETUSERSHELL''@/0/g' \\
hello>       -e 's/@''GNULIB_GROUP_MEMBER''@/0/g' \\
hello>       -e 's/@''GNULIB_ISATTY''@/0/g' \\
hello>       -e 's/@''GNULIB_LCHOWN''@/0/g' \\
hello>       -e 's/@''GNULIB_LINK''@/0/g' \\
hello>       -e 's/@''GNULIB_LINKAT''@/0/g' \\
hello>       -e 's/@''GNULIB_LSEEK''@/0/g' \\
hello>       -e 's/@''GNULIB_PIPE''@/0/g' \\
hello>       -e 's/@''GNULIB_PIPE2''@/0/g' \\
hello>       -e 's/@''GNULIB_PREAD''@/0/g' \\
hello>       -e 's/@''GNULIB_PWRITE''@/0/g' \\
hello>       -e 's/@''GNULIB_READ''@/0/g' \\
hello>       -e 's/@''GNULIB_READLINK''@/0/g' \\
hello>       -e 's/@''GNULIB_READLINKAT''@/0/g' \\
hello>       -e 's/@''GNULIB_RMDIR''@/0/g' \\
hello>       -e 's/@''GNULIB_SETHOSTNAME''@/0/g' \\
hello>       -e 's/@''GNULIB_SLEEP''@/0/g' \\
hello>       -e 's/@''GNULIB_SYMLINK''@/0/g' \\
hello>       -e 's/@''GNULIB_SYMLINKAT''@/0/g' \\
hello>       -e 's/@''GNULIB_TRUNCATE''@/0/g' \\
hello>       -e 's/@''GNULIB_TTYNAME_R''@/0/g' \\
hello>       -e 's/@''GNULIB_UNISTD_H_GETOPT''@/0/g' \\
hello>       -e 's/@''GNULIB_UNISTD_H_NONBLOCKING''@/0/g' \\
hello>       -e 's/@''GNULIB_UNISTD_H_SIGPIPE''@/0/g' \\
hello>       -e 's/@''GNULIB_UNLINK''@/0/g' \\
hello>       -e 's/@''GNULIB_UNLINKAT''@/0/g' \\
hello>       -e 's/@''GNULIB_USLEEP''@/0/g' \\
hello>       -e 's/@''GNULIB_WRITE''@/0/g' \\
hello>       -e 's/@''GNULIB_MDA_ACCESS''@/1/g' \\
hello>       -e 's/@''GNULIB_MDA_CHDIR''@/1/g' \\
hello>       -e 's/@''GNULIB_MDA_CLOSE''@/1/g' \\
hello>       -e 's/@''GNULIB_MDA_DUP''@/1/g' \\
hello>       -e 's/@''GNULIB_MDA_DUP2''@/1/g' \\
hello>       -e 's/@''GNULIB_MDA_EXECL''@/1/g' \\
hello>       -e 's/@''GNULIB_MDA_EXECLE''@/1/g' \\
hello>       -e 's/@''GNULIB_MDA_EXECLP''@/1/g' \\
hello>       -e 's/@''GNULIB_MDA_EXECV''@/1/g' \\
hello>       -e 's/@''GNULIB_MDA_EXECVE''@/1/g' \\
hello>       -e 's/@''GNULIB_MDA_EXECVP''@/1/g' \\
hello>       -e 's/@''GNULIB_MDA_EXECVPE''@/1/g' \\
hello>       -e 's/@''GNULIB_MDA_GETCWD''@/1/g' \\
hello>       -e 's/@''GNULIB_MDA_GETPID''@/1/g' \\
hello>       -e 's/@''GNULIB_MDA_ISATTY''@/1/g' \\
hello>       -e 's/@''GNULIB_MDA_LSEEK''@/1/g' \\
hello>       -e 's/@''GNULIB_MDA_READ''@/1/g' \\
hello>       -e 's/@''GNULIB_MDA_RMDIR''@/1/g' \\
hello>       -e 's/@''GNULIB_MDA_SWAB''@/1/g' \\
hello>       -e 's/@''GNULIB_MDA_UNLINK''@/1/g' \\
hello>       -e 's/@''GNULIB_MDA_WRITE''@/1/g' \\
hello>       < ./lib/unistd.in.h | \\
hello>   sed -e 's|@''HAVE_CHOWN''@|1|g' \\
hello>       -e 's|@''HAVE_COPY_FILE_RANGE''@|1|g' \\
hello>       -e 's|@''HAVE_DUP3''@|1|g' \\
hello>       -e 's|@''HAVE_EUIDACCESS''@|1|g' \\
hello>       -e 's|@''HAVE_EXECVPE''@|1|g' \\
hello>       -e 's|@''HAVE_FACCESSAT''@|1|g' \\
hello>       -e 's|@''HAVE_FCHDIR''@|1|g' \\
hello>       -e 's|@''HAVE_FCHOWNAT''@|1|g' \\
hello>       -e 's|@''HAVE_FDATASYNC''@|1|g' \\
hello>       -e 's|@''HAVE_FSYNC''@|1|g' \\
hello>       -e 's|@''HAVE_FTRUNCATE''@|1|g' \\
hello>       -e 's|@''HAVE_GETDTABLESIZE''@|1|g' \\
hello>       -e 's|@''HAVE_GETENTROPY''@|1|g' \\
hello>       -e 's|@''HAVE_GETGROUPS''@|1|g' \\
hello>       -e 's|@''HAVE_GETHOSTNAME''@|1|g' \\
hello>       -e 's|@''HAVE_GETPAGESIZE''@|1|g' \\
hello>       -e 's|@''HAVE_GETPASS''@|1|g' \\
hello>       -e 's|@''HAVE_GROUP_MEMBER''@|1|g' \\
hello>       -e 's|@''HAVE_LCHOWN''@|1|g' \\
hello>       -e 's|@''HAVE_LINK''@|1|g' \\
hello>       -e 's|@''HAVE_LINKAT''@|1|g' \\
hello>       -e 's|@''HAVE_PIPE''@|1|g' \\
hello>       -e 's|@''HAVE_PIPE2''@|1|g' \\
hello>       -e 's|@''HAVE_PREAD''@|1|g' \\
hello>       -e 's|@''HAVE_PWRITE''@|1|g' \\
hello>       -e 's|@''HAVE_READLINK''@|1|g' \\
hello>       -e 's|@''HAVE_READLINKAT''@|1|g' \\
hello>       -e 's|@''HAVE_SETHOSTNAME''@|1|g' \\
hello>       -e 's|@''HAVE_SLEEP''@|1|g' \\
hello>       -e 's|@''HAVE_SYMLINK''@|1|g' \\
hello>       -e 's|@''HAVE_SYMLINKAT''@|1|g' \\
hello>       -e 's|@''HAVE_UNLINKAT''@|1|g' \\
hello>       -e 's|@''HAVE_USLEEP''@|1|g' \\
hello>       -e 's|@''HAVE_DECL_ENVIRON''@|1|g' \\
hello>       -e 's|@''HAVE_DECL_EXECVPE''@|1|g' \\
hello>       -e 's|@''HAVE_DECL_FCHDIR''@|1|g' \\
hello>       -e 's|@''HAVE_DECL_FDATASYNC''@|1|g' \\
hello>       -e 's|@''HAVE_DECL_GETDOMAINNAME''@|1|g' \\
hello>       -e 's|@''HAVE_DECL_GETLOGIN''@|1|g' \\
hello>       -e 's|@''HAVE_DECL_GETLOGIN_R''@|1|g' \\
hello>       -e 's|@''HAVE_DECL_GETPAGESIZE''@|1|g' \\
hello>       -e 's|@''HAVE_DECL_GETUSERSHELL''@|1|g' \\
hello>       -e 's|@''HAVE_DECL_SETHOSTNAME''@|1|g' \\
hello>       -e 's|@''HAVE_DECL_TRUNCATE''@|1|g' \\
hello>       -e 's|@''HAVE_DECL_TTYNAME_R''@|1|g' \\
hello>       -e 's|@''HAVE_OS_H''@|0|g' \\
hello>       -e 's|@''HAVE_SYS_PARAM_H''@|0|g' \\
hello>   | \\
hello>   sed -e 's|@''REPLACE_ACCESS''@|0|g' \\
hello>       -e 's|@''REPLACE_CHOWN''@|0|g' \\
hello>       -e 's|@''REPLACE_CLOSE''@|0|g' \\
hello>       -e 's|@''REPLACE_DUP''@|0|g' \\
hello>       -e 's|@''REPLACE_DUP2''@|0|g' \\
hello>       -e 's|@''REPLACE_EXECL''@|0|g' \\
hello>       -e 's|@''REPLACE_EXECLE''@|0|g' \\
hello>       -e 's|@''REPLACE_EXECLP''@|0|g' \\
hello>       -e 's|@''REPLACE_EXECV''@|0|g' \\
hello>       -e 's|@''REPLACE_EXECVE''@|0|g' \\
hello>       -e 's|@''REPLACE_EXECVP''@|0|g' \\
hello>       -e 's|@''REPLACE_EXECVPE''@|0|g' \\
hello>       -e 's|@''REPLACE_FACCESSAT''@|0|g' \\
hello>       -e 's|@''REPLACE_FCHOWNAT''@|0|g' \\
hello>       -e 's|@''REPLACE_FTRUNCATE''@|0|g' \\
hello>       -e 's|@''REPLACE_GETCWD''@|0|g' \\
hello>       -e 's|@''REPLACE_GETDOMAINNAME''@|0|g' \\
hello>       -e 's|@''REPLACE_GETDTABLESIZE''@|0|g' \\
hello>       -e 's|@''REPLACE_GETLOGIN_R''@|0|g' \\
hello>       -e 's|@''REPLACE_GETGROUPS''@|0|g' \\
hello>       -e 's|@''REPLACE_GETPAGESIZE''@|0|g' \\
hello>       -e 's|@''REPLACE_GETPASS''@|0|g' \\
hello>       -e 's|@''REPLACE_ISATTY''@|0|g' \\
hello>       -e 's|@''REPLACE_LCHOWN''@|0|g' \\
hello>       -e 's|@''REPLACE_LINK''@|0|g' \\
hello>       -e 's|@''REPLACE_LINKAT''@|0|g' \\
hello>       -e 's|@''REPLACE_LSEEK''@|0|g' \\
hello>       -e 's|@''REPLACE_PREAD''@|0|g' \\
hello>       -e 's|@''REPLACE_PWRITE''@|0|g' \\
hello>       -e 's|@''REPLACE_READ''@|0|g' \\
hello>       -e 's|@''REPLACE_READLINK''@|0|g' \\
hello>       -e 's|@''REPLACE_READLINKAT''@|0|g' \\
hello>       -e 's|@''REPLACE_RMDIR''@|0|g' \\
hello>       -e 's|@''REPLACE_SLEEP''@|0|g' \\
hello>       -e 's|@''REPLACE_SYMLINK''@|0|g' \\
hello>       -e 's|@''REPLACE_SYMLINKAT''@|0|g' \\
hello>       -e 's|@''REPLACE_TRUNCATE''@|0|g' \\
hello>       -e 's|@''REPLACE_TTYNAME_R''@|0|g' \\
hello>       -e 's|@''REPLACE_UNLINK''@|0|g' \\
hello>       -e 's|@''REPLACE_UNLINKAT''@|0|g' \\
hello>       -e 's|@''REPLACE_USLEEP''@|0|g' \\
hello>       -e 's|@''REPLACE_WRITE''@|0|g' \\
hello>       -e 's|@''UNISTD_H_HAVE_SYS_RANDOM_H''@|0|g' \\
hello>       -e 's|@''UNISTD_H_HAVE_WINSOCK2_H''@|0|g' \\
hello>       -e 's|@''UNISTD_H_HAVE_WINSOCK2_H_AND_USE_SOCKETS''@|0|g' \\
hello>       -e '/definitions of _GL_FUNCDECL_RPL/r ./lib/c++defs.h' \\
hello>       -e '/definition of _GL_ARG_NONNULL/r ./lib/arg-nonnull.h' \\
hello>       -e '/definition of _GL_WARN_ON_USE/r ./lib/warn-on-use.h'; \\
hello> } > lib/unistd.h-t && \\
hello> mv lib/unistd.h-t lib/unistd.h
hello> rm -f lib/unistr.h-t lib/unistr.h && \\
hello> { echo '/* DO NOT EDIT! GENERATED AUTOMATICALLY! */'; \\
hello>   cat ./lib/unistr.in.h; \\
hello> } > lib/unistr.h-t && \\
hello> mv -f lib/unistr.h-t lib/unistr.h
hello> rm -f lib/unitypes.h-t lib/unitypes.h && \\
hello> { echo '/* DO NOT EDIT! GENERATED AUTOMATICALLY! */'; \\
hello>   cat ./lib/unitypes.in.h; \\
hello> } > lib/unitypes.h-t && \\
hello> mv -f lib/unitypes.h-t lib/unitypes.h
hello> rm -f lib/uniwidth.h-t lib/uniwidth.h && \\
hello> { echo '/* DO NOT EDIT! GENERATED AUTOMATICALLY! */'; \\
hello>   cat ./lib/uniwidth.in.h; \\
hello> } > lib/uniwidth.h-t && \\
hello> mv -f lib/uniwidth.h-t lib/uniwidth.h
hello> rm -f lib/wchar.h-t lib/wchar.h && \\
hello> { echo '/* DO NOT EDIT! GENERATED AUTOMATICALLY! */'; \\
hello>   sed -e 's|@''GUARD_PREFIX''@|GL|g' \\
hello>       -e 's|@''INCLUDE_NEXT''@|include_next|g' \\
hello>       -e 's|@''PRAGMA_SYSTEM_HEADER''@|#pragma GCC system_header|g' \\
hello>       -e 's|@''PRAGMA_COLUMNS''@||g' \\
hello>       -e 's|@''HAVE_FEATURES_H''@|1|g' \\
hello>       -e 's|@''NEXT_WCHAR_H''@|<wchar.h>|g' \\
hello>       -e 's|@''HAVE_WCHAR_H''@|1|g' \\
hello>       -e 's/@''HAVE_CRTDEFS_H''@/0/g' \\
hello>       -e 's/@''GNULIB_OVERRIDES_WINT_T''@/0/g' \\
hello>       -e 's/@''GNULIB_BTOWC''@/0/g' \\
hello>       -e 's/@''GNULIB_WCTOB''@/0/g' \\
hello>       -e 's/@''GNULIB_MBSINIT''@/1/g' \\
hello>       -e 's/@''GNULIB_MBRTOWC''@/1/g' \\
hello>       -e 's/@''GNULIB_MBRLEN''@/0/g' \\
hello>       -e 's/@''GNULIB_MBSRTOWCS''@/1/g' \\
hello>       -e 's/@''GNULIB_MBSNRTOWCS''@/0/g' \\
hello>       -e 's/@''GNULIB_WCRTOMB''@/0/g' \\
hello>       -e 's/@''GNULIB_WCSRTOMBS''@/0/g' \\
hello>       -e 's/@''GNULIB_WCSNRTOMBS''@/0/g' \\
hello>       -e 's/@''GNULIB_WCWIDTH''@/1/g' \\
hello>       -e 's/@''GNULIB_WMEMCHR''@/0/g' \\
hello>       -e 's/@''GNULIB_WMEMCMP''@/0/g' \\
hello>       -e 's/@''GNULIB_WMEMCPY''@/0/g' \\
hello>       -e 's/@''GNULIB_WMEMMOVE''@/0/g' \\
hello>       -e 's/@''GNULIB_WMEMPCPY''@/0/g' \\
hello>       -e 's/@''GNULIB_WMEMSET''@/0/g' \\
hello>       -e 's/@''GNULIB_WCSLEN''@/0/g' \\
hello>       -e 's/@''GNULIB_WCSNLEN''@/0/g' \\
hello>       -e 's/@''GNULIB_WCSCPY''@/0/g' \\
hello>       -e 's/@''GNULIB_WCPCPY''@/0/g' \\
hello>       -e 's/@''GNULIB_WCSNCPY''@/0/g' \\
hello>       -e 's/@''GNULIB_WCPNCPY''@/0/g' \\
hello>       -e 's/@''GNULIB_WCSCAT''@/0/g' \\
hello>       -e 's/@''GNULIB_WCSNCAT''@/0/g' \\
hello>       -e 's/@''GNULIB_WCSCMP''@/0/g' \\
hello>       -e 's/@''GNULIB_WCSNCMP''@/0/g' \\
hello>       -e 's/@''GNULIB_WCSCASECMP''@/0/g' \\
hello>       -e 's/@''GNULIB_WCSNCASECMP''@/0/g' \\
hello>       -e 's/@''GNULIB_WCSCOLL''@/0/g' \\
hello>       -e 's/@''GNULIB_WCSXFRM''@/0/g' \\
hello>       -e 's/@''GNULIB_WCSDUP''@/0/g' \\
hello>       -e 's/@''GNULIB_WCSCHR''@/0/g' \\
hello>       -e 's/@''GNULIB_WCSRCHR''@/0/g' \\
hello>       -e 's/@''GNULIB_WCSCSPN''@/0/g' \\
hello>       -e 's/@''GNULIB_WCSSPN''@/0/g' \\
hello>       -e 's/@''GNULIB_WCSPBRK''@/0/g' \\
hello>       -e 's/@''GNULIB_WCSSTR''@/0/g' \\
hello>       -e 's/@''GNULIB_WCSTOK''@/0/g' \\
hello>       -e 's/@''GNULIB_WCSWIDTH''@/0/g' \\
hello>       -e 's/@''GNULIB_WCSFTIME''@/0/g' \\
hello>       -e 's/@''GNULIB_MDA_WCSDUP''@/1/g' \\
hello>       < ./lib/wchar.in.h | \\
hello>   sed -e 's|@''HAVE_WINT_T''@|1|g' \\
hello>       -e 's|@''HAVE_BTOWC''@|1|g' \\
hello>       -e 's|@''HAVE_MBSINIT''@|1|g' \\
hello>       -e 's|@''HAVE_MBRTOWC''@|1|g' \\
hello>       -e 's|@''HAVE_MBRLEN''@|1|g' \\
hello>       -e 's|@''HAVE_MBSRTOWCS''@|1|g' \\
hello>       -e 's|@''HAVE_MBSNRTOWCS''@|1|g' \\
hello>       -e 's|@''HAVE_WCRTOMB''@|1|g' \\
hello>       -e 's|@''HAVE_WCSRTOMBS''@|1|g' \\
hello>       -e 's|@''HAVE_WCSNRTOMBS''@|1|g' \\
hello>       -e 's|@''HAVE_WMEMCHR''@|1|g' \\
hello>       -e 's|@''HAVE_WMEMCMP''@|1|g' \\
hello>       -e 's|@''HAVE_WMEMCPY''@|1|g' \\
hello>       -e 's|@''HAVE_WMEMMOVE''@|1|g' \\
hello>       -e 's|@''HAVE_WMEMPCPY''@|1|g' \\
hello>       -e 's|@''HAVE_WMEMSET''@|1|g' \\
hello>       -e 's|@''HAVE_WCSLEN''@|1|g' \\
hello>       -e 's|@''HAVE_WCSNLEN''@|1|g' \\
hello>       -e 's|@''HAVE_WCSCPY''@|1|g' \\
hello>       -e 's|@''HAVE_WCPCPY''@|1|g' \\
hello>       -e 's|@''HAVE_WCSNCPY''@|1|g' \\
hello>       -e 's|@''HAVE_WCPNCPY''@|1|g' \\
hello>       -e 's|@''HAVE_WCSCAT''@|1|g' \\
hello>       -e 's|@''HAVE_WCSNCAT''@|1|g' \\
hello>       -e 's|@''HAVE_WCSCMP''@|1|g' \\
hello>       -e 's|@''HAVE_WCSNCMP''@|1|g' \\
hello>       -e 's|@''HAVE_WCSCASECMP''@|1|g' \\
hello>       -e 's|@''HAVE_WCSNCASECMP''@|1|g' \\
hello>       -e 's|@''HAVE_WCSCOLL''@|1|g' \\
hello>       -e 's|@''HAVE_WCSXFRM''@|1|g' \\
hello>       -e 's|@''HAVE_WCSDUP''@|1|g' \\
hello>       -e 's|@''HAVE_WCSCHR''@|1|g' \\
hello>       -e 's|@''HAVE_WCSRCHR''@|1|g' \\
hello>       -e 's|@''HAVE_WCSCSPN''@|1|g' \\
hello>       -e 's|@''HAVE_WCSSPN''@|1|g' \\
hello>       -e 's|@''HAVE_WCSPBRK''@|1|g' \\
hello>       -e 's|@''HAVE_WCSSTR''@|1|g' \\
hello>       -e 's|@''HAVE_WCSTOK''@|1|g' \\
hello>       -e 's|@''HAVE_WCSWIDTH''@|1|g' \\
hello>       -e 's|@''HAVE_WCSFTIME''@|1|g' \\
hello>       -e 's|@''HAVE_DECL_WCTOB''@|1|g' \\
hello>       -e 's|@''HAVE_DECL_WCSDUP''@|1|g' \\
hello>       -e 's|@''HAVE_DECL_WCWIDTH''@|1|g' \\
hello>   | \\
hello>   sed -e 's|@''REPLACE_MBSTATE_T''@|0|g' \\
hello>       -e 's|@''REPLACE_BTOWC''@|0|g' \\
hello>       -e 's|@''REPLACE_WCTOB''@|0|g' \\
hello>       -e 's|@''REPLACE_MBSINIT''@|0|g' \\
hello>       -e 's|@''REPLACE_MBRTOWC''@|1|g' \\
hello>       -e 's|@''REPLACE_MBRLEN''@|0|g' \\
hello>       -e 's|@''REPLACE_MBSRTOWCS''@|0|g' \\
hello>       -e 's|@''REPLACE_MBSNRTOWCS''@|0|g' \\
hello>       -e 's|@''REPLACE_WCRTOMB''@|0|g' \\
hello>       -e 's|@''REPLACE_WCSRTOMBS''@|0|g' \\
hello>       -e 's|@''REPLACE_WCSNRTOMBS''@|0|g' \\
hello>       -e 's|@''REPLACE_WCWIDTH''@|0|g' \\
hello>       -e 's|@''REPLACE_WCSWIDTH''@|0|g' \\
hello>       -e 's|@''REPLACE_WCSFTIME''@|0|g' \\
hello>       -e 's|@''REPLACE_WCSTOK''@|0|g' \\
hello>       -e '/definitions of _GL_FUNCDECL_RPL/r ./lib/c++defs.h' \\
hello>       -e '/definition of _GL_ARG_NONNULL/r ./lib/arg-nonnull.h' \\
hello>       -e '/definition of _GL_WARN_ON_USE/r ./lib/warn-on-use.h'; \\
hello> } > lib/wchar.h-t && \\
hello> mv lib/wchar.h-t lib/wchar.h
hello> rm -f lib/wctype.h-t lib/wctype.h && \\
hello> { echo '/* DO NOT EDIT! GENERATED AUTOMATICALLY! */'; \\
hello>   sed -e 's|@''GUARD_PREFIX''@|GL|g' \\
hello>       -e 's/@''HAVE_WCTYPE_H''@/1/g' \\
hello>       -e 's|@''INCLUDE_NEXT''@|include_next|g' \\
hello>       -e 's|@''PRAGMA_SYSTEM_HEADER''@|#pragma GCC system_header|g' \\
hello>       -e 's|@''PRAGMA_COLUMNS''@||g' \\
hello>       -e 's|@''NEXT_WCTYPE_H''@|<wctype.h>|g' \\
hello>       -e 's/@''HAVE_CRTDEFS_H''@/0/g' \\
hello>       -e 's/@''GNULIB_OVERRIDES_WINT_T''@/0/g' \\
hello>       -e 's/@''GNULIB_ISWBLANK''@/1/g' \\
hello>       -e 's/@''GNULIB_ISWDIGIT''@/1/g' \\
hello>       -e 's/@''GNULIB_ISWXDIGIT''@/1/g' \\
hello>       -e 's/@''GNULIB_WCTYPE''@/0/g' \\
hello>       -e 's/@''GNULIB_ISWCTYPE''@/0/g' \\
hello>       -e 's/@''GNULIB_WCTRANS''@/0/g' \\
hello>       -e 's/@''GNULIB_TOWCTRANS''@/0/g' \\
hello>       -e 's/@''HAVE_ISWBLANK''@/1/g' \\
hello>       -e 's/@''HAVE_ISWCNTRL''@/1/g' \\
hello>       -e 's/@''HAVE_WCTYPE_T''@/1/g' \\
hello>       -e 's/@''HAVE_WCTRANS_T''@/1/g' \\
hello>       -e 's/@''HAVE_WINT_T''@/1/g' \\
hello>       -e 's/@''REPLACE_ISWBLANK''@/0/g' \\
hello>       -e 's/@''REPLACE_ISWDIGIT''@/0/g' \\
hello>       -e 's/@''REPLACE_ISWXDIGIT''@/0/g' \\
hello>       -e 's/@''REPLACE_ISWCNTRL''@/0/g' \\
hello>       -e 's/@''REPLACE_TOWLOWER''@/0/g' \\
hello>       -e '/definitions of _GL_FUNCDECL_RPL/r ./lib/c++defs.h' \\
hello>       -e '/definition of _GL_WARN_ON_USE/r ./lib/warn-on-use.h' \\
hello>       < ./lib/wctype.in.h; \\
hello> } > lib/wctype.h-t && \\
hello> mv lib/wctype.h-t lib/wctype.h
hello> make  all-recursive
hello> make[1]: Entering directory '/build/hello-2.12.1'
hello> Making all in po
hello> make[2]: Entering directory '/build/hello-2.12.1/po'
hello> Makefile:170: warning: ignoring prerequisites on suffix rule definition
hello> make[2]: Nothing to be done for 'all'.
hello> make[2]: Leaving directory '/build/hello-2.12.1/po'
hello> make[2]: Entering directory '/build/hello-2.12.1'
hello> gcc -DLOCALEDIR=\\"/nix/store/lz9gfg6iybsh0hiignpk55w99a3bj4vb-hello-2.12.1/share/locale\\" -DHAVE_CONFIG_H -I.  -Ilib -I./lib -Isrc -I./src   -g -O2 -c -o src/hello.o src/hello.c
hello> gcc -DLOCALEDIR=\\"/nix/store/lz9gfg6iybsh0hiignpk55w99a3bj4vb-hello-2.12.1/share/locale\\" -DHAVE_CONFIG_H -I.  -Ilib -I./lib -Isrc -I./src   -g -O2 -c -o lib/basename-lgpl.o lib/basename-lgpl.c
hello> gcc -DLOCALEDIR=\\"/nix/store/lz9gfg6iybsh0hiignpk55w99a3bj4vb-hello-2.12.1/share/locale\\" -DHAVE_CONFIG_H -I.  -Ilib -I./lib -Isrc -I./src   -g -O2 -c -o lib/c-ctype.o lib/c-ctype.c
hello> gcc -DLOCALEDIR=\\"/nix/store/lz9gfg6iybsh0hiignpk55w99a3bj4vb-hello-2.12.1/share/locale\\" -DHAVE_CONFIG_H -I.  -Ilib -I./lib -Isrc -I./src   -g -O2 -c -o lib/c-strcasecmp.o lib/c-strcasecmp.c
hello> gcc -DLOCALEDIR=\\"/nix/store/lz9gfg6iybsh0hiignpk55w99a3bj4vb-hello-2.12.1/share/locale\\" -DHAVE_CONFIG_H -I.  -Ilib -I./lib -Isrc -I./src   -g -O2 -c -o lib/c-strncasecmp.o lib/c-strncasecmp.c
hello> gcc -DLOCALEDIR=\\"/nix/store/lz9gfg6iybsh0hiignpk55w99a3bj4vb-hello-2.12.1/share/locale\\" -DHAVE_CONFIG_H -I.  -Ilib -I./lib -Isrc -I./src   -g -O2 -c -o lib/cloexec.o lib/cloexec.c
hello> gcc -DLOCALEDIR=\\"/nix/store/lz9gfg6iybsh0hiignpk55w99a3bj4vb-hello-2.12.1/share/locale\\" -DHAVE_CONFIG_H -I.  -Ilib -I./lib -Isrc -I./src   -g -O2 -c -o lib/close-stream.o lib/close-stream.c
hello> gcc -DLOCALEDIR=\\"/nix/store/lz9gfg6iybsh0hiignpk55w99a3bj4vb-hello-2.12.1/share/locale\\" -DHAVE_CONFIG_H -I.  -Ilib -I./lib -Isrc -I./src   -g -O2 -c -o lib/closeout.o lib/closeout.c
hello> gcc -DLOCALEDIR=\\"/nix/store/lz9gfg6iybsh0hiignpk55w99a3bj4vb-hello-2.12.1/share/locale\\" -DHAVE_CONFIG_H -I.  -Ilib -I./lib -Isrc -I./src   -g -O2 -c -o lib/dirname.o lib/dirname.c
hello> gcc -DLOCALEDIR=\\"/nix/store/lz9gfg6iybsh0hiignpk55w99a3bj4vb-hello-2.12.1/share/locale\\" -DHAVE_CONFIG_H -I.  -Ilib -I./lib -Isrc -I./src   -g -O2 -c -o lib/basename.o lib/basename.c
hello> gcc -DLOCALEDIR=\\"/nix/store/lz9gfg6iybsh0hiignpk55w99a3bj4vb-hello-2.12.1/share/locale\\" -DHAVE_CONFIG_H -I.  -Ilib -I./lib -Isrc -I./src   -g -O2 -c -o lib/dirname-lgpl.o lib/dirname-lgpl.c
hello> gcc -DLOCALEDIR=\\"/nix/store/lz9gfg6iybsh0hiignpk55w99a3bj4vb-hello-2.12.1/share/locale\\" -DHAVE_CONFIG_H -I.  -Ilib -I./lib -Isrc -I./src   -g -O2 -c -o lib/stripslash.o lib/stripslash.c
hello> gcc -DLOCALEDIR=\\"/nix/store/lz9gfg6iybsh0hiignpk55w99a3bj4vb-hello-2.12.1/share/locale\\" -DHAVE_CONFIG_H -I.  -Ilib -I./lib -Isrc -I./src   -g -O2 -c -o lib/exitfail.o lib/exitfail.c
hello> gcc -DLOCALEDIR=\\"/nix/store/lz9gfg6iybsh0hiignpk55w99a3bj4vb-hello-2.12.1/share/locale\\" -DHAVE_CONFIG_H -I.  -Ilib -I./lib -Isrc -I./src   -g -O2 -c -o lib/fd-hook.o lib/fd-hook.c
hello> gcc -DLOCALEDIR=\\"/nix/store/lz9gfg6iybsh0hiignpk55w99a3bj4vb-hello-2.12.1/share/locale\\" -DHAVE_CONFIG_H -I.  -Ilib -I./lib -Isrc -I./src   -g -O2 -c -o lib/getprogname.o lib/getprogname.c
hello> gcc -DLOCALEDIR=\\"/nix/store/lz9gfg6iybsh0hiignpk55w99a3bj4vb-hello-2.12.1/share/locale\\" -DHAVE_CONFIG_H -I.  -Ilib -I./lib -Isrc -I./src   -g -O2 -c -o lib/hard-locale.o lib/hard-locale.c
hello> gcc -DLOCALEDIR=\\"/nix/store/lz9gfg6iybsh0hiignpk55w99a3bj4vb-hello-2.12.1/share/locale\\" -DHAVE_CONFIG_H -I.  -Ilib -I./lib -Isrc -I./src   -g -O2 -c -o lib/localcharset.o lib/localcharset.c
hello> gcc -DLOCALEDIR=\\"/nix/store/lz9gfg6iybsh0hiignpk55w99a3bj4vb-hello-2.12.1/share/locale\\" -DHAVE_CONFIG_H -I.  -Ilib -I./lib -Isrc -I./src   -g -O2 -c -o lib/malloca.o lib/malloca.c
hello> gcc -DLOCALEDIR=\\"/nix/store/lz9gfg6iybsh0hiignpk55w99a3bj4vb-hello-2.12.1/share/locale\\" -DHAVE_CONFIG_H -I.  -Ilib -I./lib -Isrc -I./src   -g -O2 -c -o lib/mbchar.o lib/mbchar.c
hello> gcc -DLOCALEDIR=\\"/nix/store/lz9gfg6iybsh0hiignpk55w99a3bj4vb-hello-2.12.1/share/locale\\" -DHAVE_CONFIG_H -I.  -Ilib -I./lib -Isrc -I./src   -g -O2 -c -o lib/mbiter.o lib/mbiter.c
hello> gcc -DLOCALEDIR=\\"/nix/store/lz9gfg6iybsh0hiignpk55w99a3bj4vb-hello-2.12.1/share/locale\\" -DHAVE_CONFIG_H -I.  -Ilib -I./lib -Isrc -I./src   -g -O2 -c -o lib/mbslen.o lib/mbslen.c
hello> gcc -DLOCALEDIR=\\"/nix/store/lz9gfg6iybsh0hiignpk55w99a3bj4vb-hello-2.12.1/share/locale\\" -DHAVE_CONFIG_H -I.  -Ilib -I./lib -Isrc -I./src   -g -O2 -c -o lib/mbsstr.o lib/mbsstr.c
hello> gcc -DLOCALEDIR=\\"/nix/store/lz9gfg6iybsh0hiignpk55w99a3bj4vb-hello-2.12.1/share/locale\\" -DHAVE_CONFIG_H -I.  -Ilib -I./lib -Isrc -I./src   -g -O2 -c -o lib/mbuiter.o lib/mbuiter.c
hello> gcc -DLOCALEDIR=\\"/nix/store/lz9gfg6iybsh0hiignpk55w99a3bj4vb-hello-2.12.1/share/locale\\" -DHAVE_CONFIG_H -I.  -Ilib -I./lib -Isrc -I./src   -g -O2 -c -o lib/progname.o lib/progname.c
hello> gcc -DLOCALEDIR=\\"/nix/store/lz9gfg6iybsh0hiignpk55w99a3bj4vb-hello-2.12.1/share/locale\\" -DHAVE_CONFIG_H -I.  -Ilib -I./lib -Isrc -I./src   -g -O2 -c -o lib/propername.o lib/propername.c
hello> gcc -DLOCALEDIR=\\"/nix/store/lz9gfg6iybsh0hiignpk55w99a3bj4vb-hello-2.12.1/share/locale\\" -DHAVE_CONFIG_H -I.  -Ilib -I./lib -Isrc -I./src   -g -O2 -c -o lib/quotearg.o lib/quotearg.c
hello> gcc -DLOCALEDIR=\\"/nix/store/lz9gfg6iybsh0hiignpk55w99a3bj4vb-hello-2.12.1/share/locale\\" -DHAVE_CONFIG_H -I.  -Ilib -I./lib -Isrc -I./src   -g -O2 -c -o lib/setlocale_null.o lib/setlocale_null.c
hello> gcc -DLOCALEDIR=\\"/nix/store/lz9gfg6iybsh0hiignpk55w99a3bj4vb-hello-2.12.1/share/locale\\" -DHAVE_CONFIG_H -I.  -Ilib -I./lib -Isrc -I./src   -g -O2 -c -o lib/stat-time.o lib/stat-time.c
hello> gcc -DLOCALEDIR=\\"/nix/store/lz9gfg6iybsh0hiignpk55w99a3bj4vb-hello-2.12.1/share/locale\\" -DHAVE_CONFIG_H -I.  -Ilib -I./lib -Isrc -I./src   -g -O2 -c -o lib/striconv.o lib/striconv.c
hello> gcc -DLOCALEDIR=\\"/nix/store/lz9gfg6iybsh0hiignpk55w99a3bj4vb-hello-2.12.1/share/locale\\" -DHAVE_CONFIG_H -I.  -Ilib -I./lib -Isrc -I./src   -g -O2 -c -o lib/strnlen1.o lib/strnlen1.c
hello> gcc -DLOCALEDIR=\\"/nix/store/lz9gfg6iybsh0hiignpk55w99a3bj4vb-hello-2.12.1/share/locale\\" -DHAVE_CONFIG_H -I.  -Ilib -I./lib -Isrc -I./src   -g -O2 -c -o lib/trim.o lib/trim.c
hello> gcc -DLOCALEDIR=\\"/nix/store/lz9gfg6iybsh0hiignpk55w99a3bj4vb-hello-2.12.1/share/locale\\" -DHAVE_CONFIG_H -I.  -Ilib -I./lib -Isrc -I./src   -g -O2 -c -o lib/unistd.o lib/unistd.c
hello> gcc -DLOCALEDIR=\\"/nix/store/lz9gfg6iybsh0hiignpk55w99a3bj4vb-hello-2.12.1/share/locale\\" -DHAVE_CONFIG_H -I.  -Ilib -I./lib -Isrc -I./src   -g -O2 -c -o lib/unistr/u8-mbtoucr.o lib/unistr/u8-mbtoucr.c
hello> gcc -DLOCALEDIR=\\"/nix/store/lz9gfg6iybsh0hiignpk55w99a3bj4vb-hello-2.12.1/share/locale\\" -DHAVE_CONFIG_H -I.  -Ilib -I./lib -Isrc -I./src   -g -O2 -c -o lib/unistr/u8-uctomb.o lib/unistr/u8-uctomb.c
hello> gcc -DLOCALEDIR=\\"/nix/store/lz9gfg6iybsh0hiignpk55w99a3bj4vb-hello-2.12.1/share/locale\\" -DHAVE_CONFIG_H -I.  -Ilib -I./lib -Isrc -I./src   -g -O2 -c -o lib/unistr/u8-uctomb-aux.o lib/unistr/u8-uctomb-aux.c
hello> gcc -DLOCALEDIR=\\"/nix/store/lz9gfg6iybsh0hiignpk55w99a3bj4vb-hello-2.12.1/share/locale\\" -DHAVE_CONFIG_H -I.  -Ilib -I./lib -Isrc -I./src   -g -O2 -c -o lib/uniwidth/width.o lib/uniwidth/width.c
hello> gcc -DLOCALEDIR=\\"/nix/store/lz9gfg6iybsh0hiignpk55w99a3bj4vb-hello-2.12.1/share/locale\\" -DHAVE_CONFIG_H -I.  -Ilib -I./lib -Isrc -I./src   -g -O2 -c -o lib/version-etc.o lib/version-etc.c
hello> gcc -DLOCALEDIR=\\"/nix/store/lz9gfg6iybsh0hiignpk55w99a3bj4vb-hello-2.12.1/share/locale\\" -DHAVE_CONFIG_H -I.  -Ilib -I./lib -Isrc -I./src   -g -O2 -c -o lib/version-etc-fsf.o lib/version-etc-fsf.c
hello> gcc -DLOCALEDIR=\\"/nix/store/lz9gfg6iybsh0hiignpk55w99a3bj4vb-hello-2.12.1/share/locale\\" -DHAVE_CONFIG_H -I.  -Ilib -I./lib -Isrc -I./src   -g -O2 -c -o lib/wctype-h.o lib/wctype-h.c
hello> gcc -DLOCALEDIR=\\"/nix/store/lz9gfg6iybsh0hiignpk55w99a3bj4vb-hello-2.12.1/share/locale\\" -DHAVE_CONFIG_H -I.  -Ilib -I./lib -Isrc -I./src   -g -O2 -c -o lib/xmalloc.o lib/xmalloc.c
hello> gcc -DLOCALEDIR=\\"/nix/store/lz9gfg6iybsh0hiignpk55w99a3bj4vb-hello-2.12.1/share/locale\\" -DHAVE_CONFIG_H -I.  -Ilib -I./lib -Isrc -I./src   -g -O2 -c -o lib/xalloc-die.o lib/xalloc-die.c
hello> gcc -DLOCALEDIR=\\"/nix/store/lz9gfg6iybsh0hiignpk55w99a3bj4vb-hello-2.12.1/share/locale\\" -DHAVE_CONFIG_H -I.  -Ilib -I./lib -Isrc -I./src   -g -O2 -c -o lib/xstriconv.o lib/xstriconv.c
hello> gcc -DLOCALEDIR=\\"/nix/store/lz9gfg6iybsh0hiignpk55w99a3bj4vb-hello-2.12.1/share/locale\\" -DHAVE_CONFIG_H -I.  -Ilib -I./lib -Isrc -I./src   -g -O2 -c -o lib/xstrndup.o lib/xstrndup.c
hello> gcc -DLOCALEDIR=\\"/nix/store/lz9gfg6iybsh0hiignpk55w99a3bj4vb-hello-2.12.1/share/locale\\" -DHAVE_CONFIG_H -I.  -Ilib -I./lib -Isrc -I./src   -g -O2 -c -o lib/fcntl.o lib/fcntl.c
hello> gcc -DLOCALEDIR=\\"/nix/store/lz9gfg6iybsh0hiignpk55w99a3bj4vb-hello-2.12.1/share/locale\\" -DHAVE_CONFIG_H -I.  -Ilib -I./lib -Isrc -I./src   -g -O2 -c -o lib/mbrtowc.o lib/mbrtowc.c
hello> rm -f lib/libhello.a
hello> ar cr lib/libhello.a lib/basename-lgpl.o lib/c-ctype.o lib/c-strcasecmp.o lib/c-strncasecmp.o lib/cloexec.o lib/close-stream.o lib/closeout.o lib/dirname.o lib/basename.o lib/dirname-lgpl.o lib/stripslash.o lib/exitfail.o lib/fd-hook.o lib/getprogname.o lib/hard-locale.o lib/localcharset.o lib/malloca.o lib/mbchar.o lib/mbiter.o lib/mbslen.o lib/mbsstr.o lib/mbuiter.o lib/progname.o lib/propername.o lib/quotearg.o lib/setlocale_null.o lib/stat-time.o lib/striconv.o lib/strnlen1.o lib/trim.o lib/unistd.o lib/unistr/u8-mbtoucr.o lib/unistr/u8-uctomb.o lib/unistr/u8-uctomb-aux.o lib/uniwidth/width.o lib/version-etc.o lib/version-etc-fsf.o lib/wctype-h.o lib/xmalloc.o lib/xalloc-die.o lib/xstriconv.o lib/xstrndup.o lib/fcntl.o lib/mbrtowc.o
hello> ranlib lib/libhello.a
hello> gcc  -g -O2   -o hello src/hello.o  ./lib/libhello.a
hello> make[2]: Leaving directory '/build/hello-2.12.1'
hello> make[1]: Leaving directory '/build/hello-2.12.1'
hello> Running phase: checkPhase
hello> check flags: SHELL=/nix/store/xy4jjgw87sbgwylm5kn047d9gkbhsr9x-bash-5.2p37/bin/bash VERBOSE=y check
hello> if test -d ./.git                                \\
hello>  && git --version >/dev/null 2>&1; then                  \\
hello>   cd . &&                                                \\
hello>   git submodule --quiet foreach                                  \\
hello>       'test "$(git rev-parse "$sha1")"                   \\
hello>    = "$(git merge-base origin "$sha1")"'         \\
hello>     || { echo 'maint.mk: found non-public submodule commit' >&2; \\
hello>   exit 1; };                                             \\
hello> else                                                             \\
hello>   : ;                                                            \\
hello> fi
hello> make  check-recursive
hello> make[1]: Entering directory '/build/hello-2.12.1'
hello> Making check in po
hello> make[2]: Entering directory '/build/hello-2.12.1/po'
hello> Makefile:170: warning: ignoring prerequisites on suffix rule definition
hello> make[2]: Nothing to be done for 'check'.
hello> make[2]: Leaving directory '/build/hello-2.12.1/po'
hello> make[2]: Entering directory '/build/hello-2.12.1'
hello> make  check-TESTS
hello> make[3]: Entering directory '/build/hello-2.12.1'
hello> make[4]: Entering directory '/build/hello-2.12.1'
hello> PASS: tests/atexit-1
hello> PASS: tests/greeting-1
hello> SKIP: tests/greeting-2
hello> PASS: tests/hello-1
hello> PASS: tests/last-1
hello> PASS: tests/operand-1
hello> PASS: tests/traditional-1
hello> ============================================================================
hello> Testsuite summary for GNU Hello 2.12.1
hello> ============================================================================
hello> # TOTAL: 7
hello> # PASS:  6
hello> # SKIP:  1
hello> # XFAIL: 0
hello> # FAIL:  0
hello> # XPASS: 0
hello> # ERROR: 0
hello> ============================================================================
hello> make[4]: Leaving directory '/build/hello-2.12.1'
hello> make[3]: Leaving directory '/build/hello-2.12.1'
hello> make[2]: Leaving directory '/build/hello-2.12.1'
hello> make[1]: Leaving directory '/build/hello-2.12.1'
hello> Running phase: installPhase
hello> install flags: SHELL=/nix/store/xy4jjgw87sbgwylm5kn047d9gkbhsr9x-bash-5.2p37/bin/bash install
hello> make  install-recursive
hello> make[1]: Entering directory '/build/hello-2.12.1'
hello> Making install in po
hello> make[2]: Entering directory '/build/hello-2.12.1/po'
hello> Makefile:170: warning: ignoring prerequisites on suffix rule definition
hello> installing ast.gmo as /nix/store/lz9gfg6iybsh0hiignpk55w99a3bj4vb-hello-2.12.1/share/locale/ast/LC_MESSAGES/hello.mo
hello> installing bg.gmo as /nix/store/lz9gfg6iybsh0hiignpk55w99a3bj4vb-hello-2.12.1/share/locale/bg/LC_MESSAGES/hello.mo
hello> installing ca.gmo as /nix/store/lz9gfg6iybsh0hiignpk55w99a3bj4vb-hello-2.12.1/share/locale/ca/LC_MESSAGES/hello.mo
hello> installing da.gmo as /nix/store/lz9gfg6iybsh0hiignpk55w99a3bj4vb-hello-2.12.1/share/locale/da/LC_MESSAGES/hello.mo
hello> installing de.gmo as /nix/store/lz9gfg6iybsh0hiignpk55w99a3bj4vb-hello-2.12.1/share/locale/de/LC_MESSAGES/hello.mo
hello> installing el.gmo as /nix/store/lz9gfg6iybsh0hiignpk55w99a3bj4vb-hello-2.12.1/share/locale/el/LC_MESSAGES/hello.mo
hello> installing eo.gmo as /nix/store/lz9gfg6iybsh0hiignpk55w99a3bj4vb-hello-2.12.1/share/locale/eo/LC_MESSAGES/hello.mo
hello> installing es.gmo as /nix/store/lz9gfg6iybsh0hiignpk55w99a3bj4vb-hello-2.12.1/share/locale/es/LC_MESSAGES/hello.mo
hello> installing et.gmo as /nix/store/lz9gfg6iybsh0hiignpk55w99a3bj4vb-hello-2.12.1/share/locale/et/LC_MESSAGES/hello.mo
hello> installing eu.gmo as /nix/store/lz9gfg6iybsh0hiignpk55w99a3bj4vb-hello-2.12.1/share/locale/eu/LC_MESSAGES/hello.mo
hello> installing fa.gmo as /nix/store/lz9gfg6iybsh0hiignpk55w99a3bj4vb-hello-2.12.1/share/locale/fa/LC_MESSAGES/hello.mo
hello> installing fi.gmo as /nix/store/lz9gfg6iybsh0hiignpk55w99a3bj4vb-hello-2.12.1/share/locale/fi/LC_MESSAGES/hello.mo
hello> installing fr.gmo as /nix/store/lz9gfg6iybsh0hiignpk55w99a3bj4vb-hello-2.12.1/share/locale/fr/LC_MESSAGES/hello.mo
hello> installing ga.gmo as /nix/store/lz9gfg6iybsh0hiignpk55w99a3bj4vb-hello-2.12.1/share/locale/ga/LC_MESSAGES/hello.mo
hello> installing gl.gmo as /nix/store/lz9gfg6iybsh0hiignpk55w99a3bj4vb-hello-2.12.1/share/locale/gl/LC_MESSAGES/hello.mo
hello> installing he.gmo as /nix/store/lz9gfg6iybsh0hiignpk55w99a3bj4vb-hello-2.12.1/share/locale/he/LC_MESSAGES/hello.mo
hello> installing hr.gmo as /nix/store/lz9gfg6iybsh0hiignpk55w99a3bj4vb-hello-2.12.1/share/locale/hr/LC_MESSAGES/hello.mo
hello> installing hu.gmo as /nix/store/lz9gfg6iybsh0hiignpk55w99a3bj4vb-hello-2.12.1/share/locale/hu/LC_MESSAGES/hello.mo
hello> installing id.gmo as /nix/store/lz9gfg6iybsh0hiignpk55w99a3bj4vb-hello-2.12.1/share/locale/id/LC_MESSAGES/hello.mo
hello> installing it.gmo as /nix/store/lz9gfg6iybsh0hiignpk55w99a3bj4vb-hello-2.12.1/share/locale/it/LC_MESSAGES/hello.mo
hello> installing ja.gmo as /nix/store/lz9gfg6iybsh0hiignpk55w99a3bj4vb-hello-2.12.1/share/locale/ja/LC_MESSAGES/hello.mo
hello> installing ka.gmo as /nix/store/lz9gfg6iybsh0hiignpk55w99a3bj4vb-hello-2.12.1/share/locale/ka/LC_MESSAGES/hello.mo
hello> installing ko.gmo as /nix/store/lz9gfg6iybsh0hiignpk55w99a3bj4vb-hello-2.12.1/share/locale/ko/LC_MESSAGES/hello.mo
hello> installing lv.gmo as /nix/store/lz9gfg6iybsh0hiignpk55w99a3bj4vb-hello-2.12.1/share/locale/lv/LC_MESSAGES/hello.mo
hello> installing ms.gmo as /nix/store/lz9gfg6iybsh0hiignpk55w99a3bj4vb-hello-2.12.1/share/locale/ms/LC_MESSAGES/hello.mo
hello> installing nb.gmo as /nix/store/lz9gfg6iybsh0hiignpk55w99a3bj4vb-hello-2.12.1/share/locale/nb/LC_MESSAGES/hello.mo
hello> installing nl.gmo as /nix/store/lz9gfg6iybsh0hiignpk55w99a3bj4vb-hello-2.12.1/share/locale/nl/LC_MESSAGES/hello.mo
hello> installing nn.gmo as /nix/store/lz9gfg6iybsh0hiignpk55w99a3bj4vb-hello-2.12.1/share/locale/nn/LC_MESSAGES/hello.mo
hello> installing pl.gmo as /nix/store/lz9gfg6iybsh0hiignpk55w99a3bj4vb-hello-2.12.1/share/locale/pl/LC_MESSAGES/hello.mo
hello> installing pt.gmo as /nix/store/lz9gfg6iybsh0hiignpk55w99a3bj4vb-hello-2.12.1/share/locale/pt/LC_MESSAGES/hello.mo
hello> installing pt_BR.gmo as /nix/store/lz9gfg6iybsh0hiignpk55w99a3bj4vb-hello-2.12.1/share/locale/pt_BR/LC_MESSAGES/hello.mo
hello> installing ro.gmo as /nix/store/lz9gfg6iybsh0hiignpk55w99a3bj4vb-hello-2.12.1/share/locale/ro/LC_MESSAGES/hello.mo
hello> installing ru.gmo as /nix/store/lz9gfg6iybsh0hiignpk55w99a3bj4vb-hello-2.12.1/share/locale/ru/LC_MESSAGES/hello.mo
hello> installing sk.gmo as /nix/store/lz9gfg6iybsh0hiignpk55w99a3bj4vb-hello-2.12.1/share/locale/sk/LC_MESSAGES/hello.mo
hello> installing sl.gmo as /nix/store/lz9gfg6iybsh0hiignpk55w99a3bj4vb-hello-2.12.1/share/locale/sl/LC_MESSAGES/hello.mo
hello> installing sr.gmo as /nix/store/lz9gfg6iybsh0hiignpk55w99a3bj4vb-hello-2.12.1/share/locale/sr/LC_MESSAGES/hello.mo
hello> installing sv.gmo as /nix/store/lz9gfg6iybsh0hiignpk55w99a3bj4vb-hello-2.12.1/share/locale/sv/LC_MESSAGES/hello.mo
hello> installing ta.gmo as /nix/store/lz9gfg6iybsh0hiignpk55w99a3bj4vb-hello-2.12.1/share/locale/ta/LC_MESSAGES/hello.mo
hello> installing th.gmo as /nix/store/lz9gfg6iybsh0hiignpk55w99a3bj4vb-hello-2.12.1/share/locale/th/LC_MESSAGES/hello.mo
hello> installing tr.gmo as /nix/store/lz9gfg6iybsh0hiignpk55w99a3bj4vb-hello-2.12.1/share/locale/tr/LC_MESSAGES/hello.mo
hello> installing uk.gmo as /nix/store/lz9gfg6iybsh0hiignpk55w99a3bj4vb-hello-2.12.1/share/locale/uk/LC_MESSAGES/hello.mo
hello> installing vi.gmo as /nix/store/lz9gfg6iybsh0hiignpk55w99a3bj4vb-hello-2.12.1/share/locale/vi/LC_MESSAGES/hello.mo
hello> installing zh_CN.gmo as /nix/store/lz9gfg6iybsh0hiignpk55w99a3bj4vb-hello-2.12.1/share/locale/zh_CN/LC_MESSAGES/hello.mo
hello> installing zh_TW.gmo as /nix/store/lz9gfg6iybsh0hiignpk55w99a3bj4vb-hello-2.12.1/share/locale/zh_TW/LC_MESSAGES/hello.mo
hello> if test "hello" = "gettext-tools"; then \\
hello>   /nix/store/87fck6hm17chxjq7badb11mq036zbyv9-coreutils-9.7/bin/mkdir -p /nix/store/lz9gfg6iybsh0hiignpk55w99a3bj4vb-hello-2.12.1/share/gettext/po; \\
hello>   for file in Makefile.in.in remove-potcdate.sin quot.sed boldquot.sed en@quot.header en@boldquot.header insert-header.sin Rules-quot   Makevars.template; do \\
hello>     /nix/store/87fck6hm17chxjq7badb11mq036zbyv9-coreutils-9.7/bin/install -c -m 644 ./$file \\
hello>              /nix/store/lz9gfg6iybsh0hiignpk55w99a3bj4vb-hello-2.12.1/share/gettext/po/$file; \\
hello>   done; \\
hello>   for file in Makevars; do \\
hello>     rm -f /nix/store/lz9gfg6iybsh0hiignpk55w99a3bj4vb-hello-2.12.1/share/gettext/po/$file; \\
hello>   done; \\
hello> else \\
hello>   : ; \\
hello> fi
hello> make[2]: Leaving directory '/build/hello-2.12.1/po'
hello> make[2]: Entering directory '/build/hello-2.12.1'
hello> make[3]: Entering directory '/build/hello-2.12.1'
hello>  /nix/store/87fck6hm17chxjq7badb11mq036zbyv9-coreutils-9.7/bin/mkdir -p '/nix/store/lz9gfg6iybsh0hiignpk55w99a3bj4vb-hello-2.12.1/bin'
hello>   /nix/store/87fck6hm17chxjq7badb11mq036zbyv9-coreutils-9.7/bin/install -c hello '/nix/store/lz9gfg6iybsh0hiignpk55w99a3bj4vb-hello-2.12.1/bin'
hello>  /nix/store/87fck6hm17chxjq7badb11mq036zbyv9-coreutils-9.7/bin/mkdir -p '/nix/store/lz9gfg6iybsh0hiignpk55w99a3bj4vb-hello-2.12.1/share/info'
hello>  /nix/store/87fck6hm17chxjq7badb11mq036zbyv9-coreutils-9.7/bin/install -c -m 644 ./doc/hello.info '/nix/store/lz9gfg6iybsh0hiignpk55w99a3bj4vb-hello-2.12.1/share/info'
hello>  /nix/store/87fck6hm17chxjq7badb11mq036zbyv9-coreutils-9.7/bin/mkdir -p '/nix/store/lz9gfg6iybsh0hiignpk55w99a3bj4vb-hello-2.12.1/share/man/man1'
hello>  /nix/store/87fck6hm17chxjq7badb11mq036zbyv9-coreutils-9.7/bin/install -c -m 644 hello.1 '/nix/store/lz9gfg6iybsh0hiignpk55w99a3bj4vb-hello-2.12.1/share/man/man1'
hello> make[3]: Leaving directory '/build/hello-2.12.1'
hello> make[2]: Leaving directory '/build/hello-2.12.1'
hello> make[1]: Leaving directory '/build/hello-2.12.1'
hello> Running phase: fixupPhase
hello> shrinking RPATHs of ELF executables and libraries in /nix/store/lz9gfg6iybsh0hiignpk55w99a3bj4vb-hello-2.12.1
hello> shrinking /nix/store/lz9gfg6iybsh0hiignpk55w99a3bj4vb-hello-2.12.1/bin/hello
hello> checking for references to /build/ in /nix/store/lz9gfg6iybsh0hiignpk55w99a3bj4vb-hello-2.12.1...
hello> gzipping man pages under /nix/store/lz9gfg6iybsh0hiignpk55w99a3bj4vb-hello-2.12.1/share/man/
hello> patching script interpreter paths in /nix/store/lz9gfg6iybsh0hiignpk55w99a3bj4vb-hello-2.12.1
hello> stripping (with command strip and flags -S -p) in  /nix/store/lz9gfg6iybsh0hiignpk55w99a3bj4vb-hello-2.12.1/bin
hello> Running phase: installCheckPhase
hello> Executing versionCheckPhase
hello> Did not find version 2.12.1 in the output of the command /nix/store/lz9gfg6iybsh0hiignpk55w99a3bj4vb-hello-2.12.1/bin/hello --help
hello> Usage: hello [OPTION]...
hello> Print a friendly, customizable greeting.
hello> 
hello>   -t, --traditional       use traditional greeting
hello>   -g, --greeting=TEXT     use TEXT as the greeting message
hello> 
hello>       --help     display this help and exit
hello>       --version  output version information and exit
hello> 
hello> Report bugs to: bug-hello@gnu.org
hello> GNU Hello home page: <https://www.gnu.org/software/hello/>
hello> General help using GNU software: <https://www.gnu.org/gethelp/>
hello> Report GNU Hello translation bugs to <https://translationproject.org/team/>
hello> Successfully managed to find version 2.12.1 in the output of the command /nix/store/lz9gfg6iybsh0hiignpk55w99a3bj4vb-hello-2.12.1/bin/hello --version
hello> hello (GNU Hello) 2.12.1
hello> Copyright (C) 2020 Free Software Foundation, Inc.
hello> License GPLv3+: GNU GPL version 3 or later <https://gnu.org/licenses/gpl.html>.
hello> This is free software: you are free to change and redistribute it.
hello> There is NO WARRANTY, to the extent permitted by law.
hello> 
hello> Written by Karl Berry, Sami Kerola, Jim Meyering,
hello> and Reuben Thomas.
hello> Finished versionCheckPhase
hello> installcheck flags: SHELL=/nix/store/xy4jjgw87sbgwylm5kn047d9gkbhsr9x-bash-5.2p37/bin/bash installcheck
hello> Making installcheck in po
hello> make[1]: Entering directory '/build/hello-2.12.1/po'
hello> Makefile:170: warning: ignoring prerequisites on suffix rule definition
hello> make[1]: Nothing to be done for 'installcheck'.
hello> make[1]: Leaving directory '/build/hello-2.12.1/po'
hello> make[1]: Entering directory '/build/hello-2.12.1'
hello> make[1]: Nothing to be done for 'installcheck-am'.
hello> make[1]: Leaving directory '/build/hello-2.12.1'
hello>   File: /nix/store/lz9gfg6iybsh0hiignpk55w99a3bj4vb-hello-2.12.1/bin/hello
hello>   Size: 63832            Blocks: 128        IO Block: 4096   regular file
hello> Device: 0,46     Inode: 345692377   Links: 1
hello> Access: (0755/-rwxr-xr-x)  Uid: ( 1000/  nixbld)   Gid: (  100/  nixbld)
hello> Access: 2025-05-26 15:10:55.943983779 +0000
hello> Modify: 2025-05-26 15:10:55.991984377 +0000
hello> Change: 2025-05-26 15:10:56.023096705 +0000
hello>  Birth: 2025-05-26 15:10:55.943983779 +0000
`;

export default sample;
