import globby from 'globby'
import * as path from 'path'
import { DocgenCLIConfig } from './extractConfig'
import singleMd, { DocgenCLIConfigWithOutFile } from './singleMd'
import multiMd from './multiMd'

export interface DocgenCLIConfigWithComponents extends DocgenCLIConfig {
	components: string | string[]
}

function hasComponents(config: DocgenCLIConfig): config is DocgenCLIConfigWithComponents {
	return !!config.components
}

export default async (config: DocgenCLIConfig) => {
	// if at a level that has no components (top level) just give up
	if (!hasComponents(config)) return

	// if componentsRoot is not specified we start with current cwd
	config.componentsRoot = path.resolve(config.cwd, config.componentsRoot)
	// outdir can be specified as relative to cwd so absolutize it
	config.outDir = path.resolve(config.cwd, config.outDir)
	// outfile needs to be absolutized too. relative the outDir will allow us to
	// specify the root dir of docs no top of pages and build the path as we go
	// avoiding to repeat the start path
	config.outFile = config.outFile ? path.resolve(config.outDir, config.outFile) : undefined

	// for every component file in the glob,
	const files = await globby(config.components, { cwd: config.componentsRoot })

	if (config.outFile) {
		// create one combined documentation file
		singleMd(files, config as DocgenCLIConfigWithOutFile)
	} else {
		// create one documentation file per component
		multiMd(files, config)
	}
}
